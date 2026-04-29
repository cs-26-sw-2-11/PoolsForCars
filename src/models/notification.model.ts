// ====== IMPORTS ======
import * as fs from 'fs';
import { asyncAppendLineToFile, asyncReadFile, asyncWriteFile, DATABASE_DIRNAME } from '../database/helper-functions.js'

import { type AppendPassengerDTO } from '../services/groups/dto/appendPassenger.dto.js';

// ====== TYPES ======
export interface Notification {
    id: number;
    dto: AppendPassengerDTO;
}

export type Notifications = Map<number, Notification>;
export type notificationsJSON = Record<number, Notification>;

interface NotificationMeta {
    lastId: number;
}

// ====== CONFIG ======
export const NOTIFICATIONS_FILE: string = "notifications/notifications.ndjson";
export const META_FILE: string = "notifications/meta.json";

// ====== IN-MEMORY STATE ======
const NOTIFICATIONS = new Map<number, Notification>() as Notifications;
let meta: NotificationMeta;

// ====== WRITE QUEUE ======
let notificationWriteQueue: Promise<any> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    notificationWriteQueue = notificationWriteQueue.then(task, task); // handle the rejected callback properly or something
    return notificationWriteQueue;
}

// ====== INIT (load from disk) ======;
export const initNotifications = async (): Promise<void> => {
    // Load meta-data
    if (fs.existsSync(DATABASE_DIRNAME + META_FILE)) {
        try {
            const metaString: string = await asyncReadFile(META_FILE);
            if (metaString.length !== 0) {
                meta = JSON.parse(metaString) as NotificationMeta;
            } else {
                meta = { lastId: 0 } as NotificationMeta;
            }
        } catch (error) {
            console.warn("Something went wrong, trying to initialize the notifications", error);
        }
    }

    // Load notifications
    if (fs.existsSync(DATABASE_DIRNAME + NOTIFICATIONS_FILE)) {
        try {
            const notifications: string = await asyncReadFile(NOTIFICATIONS_FILE);

            const parsedNotifications: Notification[] = notifications
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => JSON.parse(line)) as Notification[];

            parsedNotifications.forEach(notification => {
                NOTIFICATIONS.set(notification.id, notification);
            });
        } catch (error) {
            console.warn("Something went wrong, trying to initialize the notifications", error);
        }
    }
}

// ====== CREATE NOTIFICATION (SAFE) ======
export const createNotification = async (appendPassengerDTO: AppendPassengerDTO): Promise<Notification> => {
    return enqueue(async () => {
        const notification: Notification = {
            id: meta.lastId++,
            dto: appendPassengerDTO,
        }

        // update memory
        NOTIFICATIONS.set(notification.id, notification);

        // append to file
        await asyncAppendLineToFile(NOTIFICATIONS_FILE, JSON.stringify(notification));

        // persist meta
        await asyncWriteFile(META_FILE, JSON.stringify(meta));

      return notification;
    })
}

// ====== READ NOTIFICATION ======
export const readNotification = async (notification_id: number): Promise<Notification> => {
    try {
        return NOTIFICATIONS.get(notification_id) as Notification;
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};


// ====== UPDATE NOTIFICATION ======
export const updateNotification = async (id: number, updated_notification: Notification): Promise<void> => {
    return enqueue(async () => {
        // update m
        // emory
        NOTIFICATIONS.set(id, updated_notification);

        // update file
        await writeNotifications(NOTIFICATIONS);
    })
};

// ====== DELETE NOTIFICATION ======
export const deleteNotification = async (id: number): Promise<void> => {
    return enqueue(async () => {
        // update memory
        NOTIFICATIONS.delete(id);

        // update file
        await writeNotifications(NOTIFICATIONS);
    })
};

// ====== WRITE NOTIFICATIONS ======
export const writeNotifications = async (notifications: Notifications): Promise<void> => {
    try {
        await asyncWriteFile(NOTIFICATIONS_FILE, "");
        for (const key of notifications.keys()) {
            await asyncAppendLineToFile(NOTIFICATIONS_FILE, JSON.stringify(notifications.get(key)));
        }
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

// ====== READ NOTIFICATIONS ======
export const readNotifications = async (): Promise<Notifications> => {
    return NOTIFICATIONS;
};

export const readNotificationsJSON = async (): Promise<notificationsJSON> => {
    const notifications: notificationsJSON = {};

    for (const key of NOTIFICATIONS.keys()) {
        notifications[key] = NOTIFICATIONS.get(key) as Notification;
    }
    return notifications;
}

// ====== CLEAR NOTIFICATIONS ======
export const clearNotifications = async (): Promise<void> => {
    await asyncWriteFile(NOTIFICATIONS_FILE, "");
    await asyncWriteFile(META_FILE, "");
}

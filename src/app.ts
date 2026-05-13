import { clearUsers, initUsers } from "./models/user.model.js";
import { clearGroups, initGroups } from "./models/group.model.js";
import * as server from "./server.js";
import { clearNotifications, initNotifications } from "./models/notification.model.js";

await clearUsers()
await clearGroups();
await initUsers();
await initGroups();
// await initNotifications();

//We use EC6 modules


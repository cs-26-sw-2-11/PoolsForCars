import { clearUsers, initUsers } from "./models/user.model.js";
import { clearGroups, initGroups } from "./models/group.model.js";
import * as server from "./server.js";


// await clearNotifications();
// await clearUsers();
// await clearGroups();
await initUsers();
await initGroups();

//We use EC6 modules


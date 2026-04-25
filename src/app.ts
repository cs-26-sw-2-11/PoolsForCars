import { clearUsers, initUsers } from "./models/user.model.js";
import * as server from "./server.js";

await clearUsers();
await initUsers();

//We use EC6 modules


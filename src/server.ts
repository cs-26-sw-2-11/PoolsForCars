import express from "express";
import routes from "./routes/index.js";
import * as path from 'path';


//=== VARIABLES ===//

// Our port number on the IWP server
const port = 3410;

const hostname = '127.0.0.1';
const app = express();
const filePath = path.resolve(process.cwd());


//=== SOMETHING ===//
// explain every lines
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/ScriptsForUsers", express.static(filePath + "/dist/html_scripts"));
app.use("/CSSforHTML", express.static(filePath + "/src/PublicResources"));
app.use(routes);



//=== STARTS SERVER ===///
app.listen(port)
console.log(`Server running at http://${hostname}:${port}/`);

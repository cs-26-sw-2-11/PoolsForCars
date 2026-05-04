import express from "express";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser"

//=== VARIABLES ===//

// Our port number on the IWP server
const port = 3410;

const hostname = '127.0.0.1';
const app = express();

// const filePath = path.resolve(process.cwd());

// makes files found in public resources accessible for serving, such as serving an js file requested by an html file.
app.use(express.static('src/PublicResources'));

//=== SOMETHING ===//
// explain every lines
// enables json functionality?
app.use(express.json());

// Enable receiving and working with req.body in express. Vital for the program.
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('idk'))

// app.use("/ScriptsForUsers", express.static(filePath + "/dist/html_scripts"));


// uses our routes, default exported from router .i.e. const router = express.Router(); found in index.ts
// Basically uses index.ts as our index for where to send http requests
app.use(routes);

//=== STARTS SERVER ===///
app.listen(port)
console.log(`Server running at http://${hostname}:${port}`);

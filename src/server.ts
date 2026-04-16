import express from "express";
import routes from "./routes/index.js";

//Defines the used variables
const hostname = '127.0.0.1';
const port = 3410;
const app = express();



//Express logic to ...
app.use(express.json());
app.use(routes);

//Listens for the server on a specific port
app.listen(port)
console.log(`Server running at http://${hostname}:${port}/`);
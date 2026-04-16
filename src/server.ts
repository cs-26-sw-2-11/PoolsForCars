import * as http from 'http';
import fs from "fs";
import express, { type Request, type Response } from "express";
import * as path from 'path';


const hostname = '127.0.0.1';
const port = 3410;
const app = express();
const router = express.Router();

app.use(express.json());
app.listen(port)
console.log(`Server running at http://${hostname}:${port}/`);



app.get("/", (req, res) => {
    const filePath = path.resolve(process.cwd(), "src","PublicResources", "HTML", "Login.html");
    res.sendFile(filePath);
})

app.get("/login", (req, res) => {
    res.sendFile("/Users/joachimpeschardt/GitRepos/PoolsForCars/src/PublicResources/HTML/Revisesignup.html");
})


//THIS APP USES ES6 MODULES  
import * as http from 'http';
import fs from "fs";

//import contentType from "content-type";
//import url from "url";
//import qs from "querystring";

import { processReq } from "./router.js";
// export { fileResponse, startServer };

const hostname = '127.0.0.1';
const port = 3410;
//const serverName="http://localhost:3000";

export const fileResponse = async (res: http.ServerResponse, filename: string) => {
    const sPath = filename;
    console.log("Reading:" + sPath);
    fs.readFile(sPath, (err, data) => {
        if (err) {
            console.error(err);
            // errorResponse(res, 404, String(err));
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', "text/html");
            res.write(data);
            res.end('\n');
        }
    })
}

/* *********************************************************************
   Setup HTTP server and route handling 
   ******************************************************************** */
const server = http.createServer(requestHandler);
async function requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    console.log(`Received request: ${req.method} ${req.url}`);
    try {
        await processReq(req, res);
    } catch (e) {
        console.log(/*InternalError + "!!: " + */ e);
        // errorResponse(res, 500, "");
    }
}

export const startServer = async () => {
    /* start the server */
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
        fs.writeFileSync('message.txt', `Server running at http://${hostname}:${port}/`);
    });
}

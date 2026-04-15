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
// NEED TO HANDLE THE DIFFERENT REQUEST COMING IN FROM USER SIGNUP, LOGIN, GROUP CREATION AND SUCH
// Responsible for processing form request to a string, it recieves the incoming message
export const handleRequest = async (req) => {
    // Stores the data as a buffer object, which contains binary data
    const chunks = [];
    // When a request comes, it pushes data to the buffer array
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    // Once all the data has arrived, it removes the spaces in the buffer
    // and converts the binary data into a string.
    return Buffer.concat(chunks).toString();
};
export const fileResponse = async (res, filename) => {
    const sPath = filename;
    console.log("Reading:" + sPath);
    fs.readFile(sPath, (err, data) => {
        if (err) {
            console.error(err);
            // errorResponse(res, 404, String(err));
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', "text/html");
            res.write(data);
            res.end('\n');
        }
    });
};
/* *********************************************************************
   Setup HTTP server and route handling
   ******************************************************************** */
const server = http.createServer(requestHandler);
async function requestHandler(req, res) {
    console.log(`Received request: ${req.method} ${req.url}`);
    try {
        await processReq(req, res);
    }
    catch (e) {
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
};
//# sourceMappingURL=server.js.map
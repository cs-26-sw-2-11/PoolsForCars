
//We use EC6 modules!
import {startServer} from "./server.js";

export {processReq};

startServer();

function processReq(req,res){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('The Server is Running... QUICKLY! Go catch it!\n');
}

 

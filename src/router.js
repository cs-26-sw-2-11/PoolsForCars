export {processReq};
import { fileResponse, startServer } from "./server.js";


startServer();

function processReq(req,res){
    console.log("GOT: " + req.method + " " +req.url);
    let baseURL = 'http://' + req.headers.host + '/';    //https://github.com/nodejs/node/issues/12682
    let url=new URL(req.url,baseURL);
  switch(req.method){
    case "GET":{
        fileResponse(res,"PublicResources/HTML/carpool.html")
    }
  }
}

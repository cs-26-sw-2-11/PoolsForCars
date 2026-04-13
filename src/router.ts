import { Serializer } from 'v8';
import { fileResponse, startServer } from './server.js';
import * as http from 'http';


startServer();

export const processReq = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log("GOT: " + req.method + " " + req.url + " " + req.headers.host);
    const parsedURL: URL = new URL(req.url ?? "", `http://${req.headers.host}`);
    const searchParams: string[] = parsedURL.searchParams.keys().toArray();
    console.log(parsedURL, searchParams.length, searchParams);

    

    switch(req.method){
    case "POST":{
        switch(req.url){
            case "/login":{
                //console.log(1231);
            }
        }
    }
    case "GET":{
        switch(req.url){
            case "/":{
            fileResponse(res,"src/PublicResources/HTML/Signup.html")
            }
            break;
            case "/login":{
            fileResponse(res,"src/PublicResources/HTML/Login.html")
            }
            break;
            defaul:
                console.log("hmmm something went wrong")
            
        /*
        //USE "sp" from above to get query search parameters
        switch(pathElements[1]){   
          case "":{
             fileResponse(res,"PublicResources/HTML/carpool.html")
          }
          break;
          case "login": {
             fileResponse(res,"PublicResources/HTML/Login.html")
          }
          break;
          default: //for anything else we assume it is a file to be served
            console.log("hmmm something went wrong")
          break;
        */
        }
    }
    }
}
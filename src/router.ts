
import { Serializer } from 'v8';
import { handleRequest, fileResponse, startServer } from './server.js';
import { createUser } from './models/user.model.js';
import type { User } from './models/user.model.js';
import * as http from 'http';
import * as app from './app.js';


startServer();


export const processReq = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log("GOT: " + req.method + " " + req.url + " " + req.headers.host);
    const parsedURL: URL = new URL(req.url ?? "", `http://${req.headers.host}`);
    const splitURL: string[] = parsedURL.pathname.split("/").filter(element => element !== "");
    const searchParams: string[] = parsedURL.searchParams.keys().toArray();
    console.log(parsedURL, searchParams.length, searchParams);

    switch(req.method){
    case "POST":{
        switch(req.url){
            case "/":{
                handleRequest(req).then((result) => {app.cleanFormStringSignup(result)})
            }
            case "/login":{
                handleRequest(req).then((result) => {app.cleanFormStringLogin(result)})
            }
        }
    }
    case "GET":{
        switch(req.url){
            case "/":
            try{
            fileResponse(res,"src/PublicResources/HTML/Signup.html")
            }   catch (err) {
                    console.log(err);
                    return 'Something went wrong';
                }
            break;
            case "/login":
            try{
            fileResponse(res,"src/PublicResources/HTML/Login.html")
            }   catch (err) {
                    console.log(err);
                    return 'Something went wrong';
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

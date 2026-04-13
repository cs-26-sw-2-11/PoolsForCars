import { Serializer } from 'v8';
import { fileResponse, startServer } from './server.js';
import * as http from 'http';
startServer();
export const processReq = async (req, res) => {
    console.log("GOT: " + req.method + " " + req.url + " " + req.headers.host);
    const parsedURL = new URL(req.url ?? "", `http://${req.headers.host}`);
    const searchParams = parsedURL.searchParams.keys().toArray();
    console.log(parsedURL, searchParams.length, searchParams);
    switch (req.method) {
        case "POST": {
            switch (req.url) {
                case "/login": {
                    //console.log(1231);
                }
            }
        }
        case "GET": {
            switch (req.url) {
                case "/":
                    {
                        fileResponse(res, "src/PublicResources/HTML/Signup.html");
                    }
                    break;
                case "/login":
                    {
                        fileResponse(res, "src/PublicResources/HTML/Login.html");
                    }
                    break;
                    defaul: console.log("hmmm something went wrong");
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
    // switch (req.method) {
    //     case "GET": {
    //         fileResponse(res, "./src/PublicResources/HTML/carpool.html")
    //     }
    // }
};
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const json = JSON.parse(body || "{}");
                resolve(json);
            }
            catch (err) {
                reject(err);
            }
        });
        req.on("error", err => {
            reject(err);
        });
    });
}
//# sourceMappingURL=router.js.map
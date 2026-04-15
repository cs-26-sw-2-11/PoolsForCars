import { createUser } from './models/user.model.js';
import type { User } from './models/user.model.js';
import { fileResponse, startServer } from './server.js';
import * as http from 'http';


startServer();

export const processReq = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log("GOT: " + req.method + " " + req.url + " " + req.headers.host);
    const parsedURL: URL = new URL(req.url ?? "", `http://${req.headers.host}`);
    const splitURL: string[] = parsedURL.pathname.split("/").filter(element => element !== "");
    const searchParams: string[] = parsedURL.searchParams.keys().toArray();
    console.log(parsedURL, searchParams.length, searchParams, splitURL);

    switch (splitURL[0]) {
        case "user": {
            switch (splitURL[1]) {
                case "create": {
                    const body: User = await parseJsonBody(req) as User;
                    await createUser(body);
                }
            }

        }
    }



    // switch (req.method) {
    //     case "GET": {
    //         fileResponse(res, "./src/PublicResources/HTML/carpool.html")
    //     }
    // }
}




function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const json = JSON.parse(body || "{}");
        resolve(json);
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", err => {
      reject(err);
    });
  });
}

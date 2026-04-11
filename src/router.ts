import { fileResponse, startServer } from './server.js';
import * as http from 'http';


startServer();

export const processReq = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log("GOT: " + req.method + " " + req.url + " " + req.headers.host);
    const parsedURL: URL = new URL(req.url ?? "", `http://${req.headers.host}`);
    const searchParams: string[] = parsedURL.searchParams.keys().toArray();
    console.log(parsedURL, searchParams.length, searchParams);
    switch (req.method) {
        case "GET": {
            fileResponse(res, "./src/PublicResources/HTML/carpool.html")
        }
    }
}

import { fileResponse, startServer } from './server.js';
import * as http from 'http';
startServer();
export const processReq = async (req, res) => {
    console.log("GOT: " + req.method + " " + req.url + " " + req.headers.host);
    const parsedURL = new URL(req.url ?? "", `http://${req.headers.host}`);
    const keyword = parsedURL.searchParams.keys().toArray();
    console.log(parsedURL, keyword.length, keyword);
    switch (req.method) {
        case "GET": {
            fileResponse(res, "./src/PublicResources/HTML/carpool.html");
        }
    }
};
//# sourceMappingURL=router.js.map
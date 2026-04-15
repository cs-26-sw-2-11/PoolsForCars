import { createUser } from './models/user.model.js';
import { fileResponse, startServer } from './server.js';
import * as http from 'http';
startServer();
export const processReq = async (req, res) => {
    console.log("GOT: " + req.method + " " + req.url + " " + req.headers.host);
    const parsedURL = new URL(req.url ?? "", `http://${req.headers.host}`);
    const splitURL = parsedURL.pathname.split("/").filter(element => element !== "");
    const searchParams = parsedURL.searchParams.keys().toArray();
    console.log(parsedURL, searchParams.length, searchParams, splitURL);
    switch (splitURL[0]) {
        case "user": {
            switch (splitURL[1]) {
                case "create": {
                    const body = await parseJsonBody(req);
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
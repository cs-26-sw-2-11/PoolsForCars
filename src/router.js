export {processReq};
import { fileResponse, startServer } from "./server.js";


const ValidationError="Validation Error";
const NoResourceError="No Such Resource";

startServer();

function processReq(req,res){
    console.log("GOT: " + req.method + " " +req.url);
    let baseURL = 'http://' + req.headers.host + '/';    //https://github.com/nodejs/node/issues/12682
    let url=new URL(req.url,baseURL);
    let searchParms=new URLSearchParams(url.search);
    let queryPath=decodeURIComponent(url.pathname); //Convert uri encoded special letters (eg æøå that is escaped by "%number") to JS string
  switch(req.method){
    case "GET":{
        fileResponse(res,"Node/PublicResources/html/carpool.html")
    }
  }
}

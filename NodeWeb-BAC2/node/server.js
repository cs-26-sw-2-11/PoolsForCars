/* *****************************************************************
  DISCLAIMER: This code is developed to support education and demo 
  purposes and certain simplifications have been made to keep the code
  short and comprehensible.
  ****************************************************************** */

//THIS APP USES ES6 MODULES  
import http from 'http';
import fs from "fs";

//import contentType from "content-type";
//import url from "url";
//import qs from "querystring";
/* ****************************************************************************
 * Application code for the yatzy application 
 ***************************************************************************** */
import {processReq} from "./router.js";
export {fileResponse, startServer};

const hostname = '127.0.0.1';
const port = 3410;
//const serverName="http://localhost:3000";


function fileResponse(res, filename){
  const sPath=filename;
  console.log("Reading:"+sPath);
  fs.readFile(sPath, (err, data) => {
    if (err) {
      console.error(err);
      errorResponse(res,404,String(err));
    }else {
      res.statusCode = 200;
      res.setHeader('Content-Type', "text/html");
      res.write(data);
      res.end('\n');
    }
  })
}


/* *********************************************************************
   Setup HTTP server and route handling 
   ******************************************************************** */
const server = http.createServer(requestHandler);
function requestHandler(req,res){
  try{
   processReq(req,res);
  }catch(e){
    console.log(InternalError +"!!: " +e);
   errorResponse(res,500,"");
  }
}

function startServer(){
 /* start the server */
 server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  fs.writeFileSync('message.txt', `Server running at http://${hostname}:${port}/`);
 });
}

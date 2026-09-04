const { error } = require('console');
const http = require('http');

/**
 * @param {{method: string, path: string, handler: () => any}[]} routes
 * @param {string} method
 * @param {string} url
 * @returns {{statusCode: number, body: any}}
 */
function matchRoute(routes, method, url) {
  // TODO: implement matching logic (404 vs 405 vs 200)
  let pathMatched=false;
  for(const route of routes){
    if(route.path==url){
      pathMatched=true;
      if(route.method==method){
        return {
          statusCode:200,
          body:route.handler()
        }
      }
    }
    
  }

  if(pathMatched){
     return {
      statusCode:405,
      body:{
        error:"Method Not Allowed"
      }
     }
  }


  return {
    statusCode:404,
    bidy:{
      error:"Not Found"
    }
  }


  
  
}

/**
 * @param {{method: string, path: string, handler: () => any}[]} routes
 * @returns {http.Server}
 */
function createServer(routes) {
  return http.createServer((req, res) => {
    // TODO: derive pathname from req.url, call matchRoute, write the response
    const pathName=req.url.split("?")[0]

    const result=matchRoute(routes,req.method,pathName);
    res.writeHead(result.statusCode, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result.body));
  });
}

module.exports = { matchRoute, createServer };
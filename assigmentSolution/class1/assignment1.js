const http = require('http');

/**
 * @param {{method: string, path: string, handler: () => any}[]} routes
 * @param {string} method
 * @param {string} url
 * @returns {{statusCode: number, body: any}}
 */
function matchRoute(routes, method, url) {
  let pathMatched = false;

  for (const route of routes) {
    if (route.path === url) {
      pathMatched = true;

      if (
        route.method.toUpperCase() === method.toUpperCase()
      ) {
        return {
          statusCode: 200,
          body: route.handler()
        };
      }
    }
  }

  if (pathMatched) {
    return {
      statusCode: 405,
      body: {
        error: "Method Not Allowed"
      }
    };
  }

  return {
    statusCode: 404,
    body: {
      error: "Not Found"
    }
  };
}

/**
 * @param {{method: string, path: string, handler: () => any}[]} routes
 * @returns {http.Server}
 */
function createServer(routes) {
  return http.createServer((req, res) => {
    const pathname = req.url.split("?")[0];

    const result = matchRoute(
      routes,
      req.method,
      pathname
    );

    res.writeHead(result.statusCode, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(result.body));
  });
}

module.exports = { matchRoute, createServer };
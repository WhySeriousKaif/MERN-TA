const express = require('express');

/**
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();
  // TODO: express.json() middleware
  // TODO: GET / -> welcome message
  // TODO: GET /health -> status + uptime
  // TODO: catch-all 404 handler (register last)
  app.use(express.json())

  app.get("/", (req, res) => {
    res.status(200).json({ message: 'Welcome to the API'});
  });
  app.get("/health" , (req, res) => {
    res.status(200).json({status: 'ok', uptime: Number(process.uptime().toFixed(2)) })
  });
  app.use((req, res) => {
    res.status(404).json({error: 'Not Found'});
  })
  
  return app;
}

/**
 * @param {import('express').Express} app
 * @param {number} port
 */
function startServer(app, port) {
  // TODO: start listening, return the server
  
}

module.exports = { createApp, startServer };
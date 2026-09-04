const express = require('express');

/**
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Parse JSON request bodies
  app.use(express.json());

  // Welcome route
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Welcome to the API'
    });
  });

  // Health route
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: Number(process.uptime().toFixed(2))
    });
  });

  // 404 fallback - must be last
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found'
    });
  });

  return app;
}

/**
 * @param {import('express').Express} app
 * @param {number} port
 */
function startServer(app, port) {
  return app.listen(port);
}

module.exports = { createApp, startServer };
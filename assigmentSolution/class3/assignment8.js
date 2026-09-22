const { MongoClient } = require("mongodb");

let client = null;
let db = null;

/**
 * Connects to MongoDB if not already connected, caches the connection, and returns the db instance.
 * @param {string} uri - MongoDB connection URI
 * @param {string} dbName - Database name
 * @returns {Promise<import('mongodb').Db>}
 */
async function connectToDatabase(uri, dbName) {
  // If already connected and db instance is cached, return it directly
  if (db) {
    return db;
  }

  // Create a new client and connect
  client = new MongoClient(uri);
  await client.connect();

  // Cache db instance
  db = client.db(dbName);
  return db;
}

/**
 * Returns the cached database instance. Throws an error if not connected.
 * @returns {import('mongodb').Db}
 */
function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase first.");
  }
  return db;
}

/**
 * Closes the database connection and resets cached client and db.
 */
async function closeConnection() {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
}

module.exports = { connectToDatabase, getDb, closeConnection };

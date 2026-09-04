const { MongoClient } = require("mongodb");

let client = null;
let db = null;

/**
 * @param {string} uri
 * @param {string} dbName
 * @returns {Promise<import('mongodb').Db>}
 */
async function connectToDatabase(uri, dbName) {
  // TODO: return cached db if present; otherwise connect, cache, and return it
}

/**
 * @returns {import('mongodb').Db}
 */
function getDb() {
  // TODO: throw if not connected, otherwise return the cached db
}

async function closeConnection() {
  // TODO: close the client, clear cached state
}

module.exports = { connectToDatabase, getDb, closeConnection };

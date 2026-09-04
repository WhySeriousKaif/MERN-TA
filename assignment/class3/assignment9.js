class ValidationError extends Error {
    constructor(message) {
      super(message);
      // TODO: set this.name
    }
  }
  
  function validateUser(userData) {
    // TODO: throw ValidationError for missing/invalid name or email
  }
  
  /**
   * @param {import('mongodb').Db} db
   * @param {{name: string, email: string, age?: number}} userData
   */
  async function createUser(db, userData) {
    // TODO: validate, check for existing email, insert, return doc with _id
  }
  
  /**
   * @param {import('mongodb').Db} db
   * @param {{name: string, email: string, age?: number}[]} usersArray
   */
  async function createManyUsers(db, usersArray) {
    // TODO: validate all, check in-batch duplicate emails, insertMany, return docs with _ids
  }
  
  module.exports = { createUser, createManyUsers, ValidationError };
  
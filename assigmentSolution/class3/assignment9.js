const { ObjectId } = require("mongodb");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateUser(userData) {
  if (
    !userData ||
    typeof userData.name !== "string" ||
    userData.name.trim() === ""
  ) {
    throw new ValidationError("Invalid name");
  }

  if (
    typeof userData.email !== "string" ||
    !userData.email.includes("@")
  ) {
    throw new ValidationError("Invalid email");
  }
}

/**
 * @param {import('mongodb').Db} db
 * @param {{name: string, email: string, age?: number}} userData
 */
async function createUser(db, userData) {
  validateUser(userData);

  const existing = await db.collection("users").findOne({
    email: userData.email
  });

  if (existing) {
    throw new ValidationError("Email already exists");
  }

  const doc = {
    name: userData.name,
    email: userData.email,
    age: userData.age ?? null,
    createdAt: new Date()
  };

  const result = await db.collection("users").insertOne(doc);

  return {
    ...doc,
    _id: result.insertedId
  };
}

/**
 * @param {import('mongodb').Db} db
 * @param {{name: string, email: string, age?: number}[]} usersArray
 */
async function createManyUsers(db, usersArray) {
  const emails = new Set();

  // Validate and check duplicate emails
  for (const user of usersArray) {
    validateUser(user);

    if (emails.has(user.email)) {
      throw new ValidationError("Duplicate email in batch");
    }

    emails.add(user.email);
  }

  const docs = usersArray.map(user => ({
    name: user.name,
    email: user.email,
    age: user.age ?? null,
    createdAt: new Date()
  }));

  const result = await db.collection("users").insertMany(docs);

  return docs.map((doc, index) => ({
    ...doc,
    _id: result.insertedIds[index]
  }));
}

module.exports = {
  createUser,
  createManyUsers,
  ValidationError
};
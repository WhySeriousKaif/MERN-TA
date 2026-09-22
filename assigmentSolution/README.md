# 📚 MERN Stack Assignment Solutions — Concepts & Master Reference Guide

> **Target Audience**: Junior Developers & MERN Stack Learners  
> **Purpose**: A comprehensive, concept-wise walkthrough of all assignments (Class 1 to Class 3). This guide explains **what** was done, **why** it was done that way, **how** we transition from low-level Node.js internals to production-ready frameworks, and the core patterns you can apply to any backend question.

---

## 🗺️ Learning Roadmap & Evolutionary Overview

Before jumping into individual solutions, understand the **journey of backend development**:

```text
Class 1: Low-Level Node.js (Built-in Modules)
   ├── http  ──> Manual server creation, raw routing, status codes
   ├── fs    ──> File system navigation, directory traversal, file inspection
   └── os    ──> System metrics, memory calculations, hardware health
          │
          ▼
Class 2: Express.js Framework (Abstraction & Ergonomics)
   ├── express()      ──> Eliminating HTTP boilerplate
   ├── express.json() ──> Body parsing middleware
   ├── req.params     ──> Dynamic URL paths (/products/:id)
   └── req.query      ──> Query strings, filtering, and field projection
          │
          ▼
Class 3: Databases (Native MongoDB Driver & Mongoose ODM)
   ├── Connection Pooling ──> Singleton connection pattern
   ├── Mongoose Schemas  ──> Enforcing structure, types, and constraints
   └── CRUD Operations   ──> find(), findById(), insertOne(), insertMany()
```

---

# 📖 Class 1: Node.js Built-In Core Modules

In Class 1, we avoid third-party libraries (`npm install`) and instead leverage Node's built-in standard library. Node provides these modules out of the box using `require('module_name')`.

---

## 1. Assignment 1: Native HTTP Server & Route Matching

📂 **File**: [assignment1.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class1/assignment1.js)

### 💡 Core Concepts
1. **The Native `http` Module**:
   * Node comes with an `http` module allowing you to create web servers without any framework.
   * Syntax: `http.createServer((req, res) => { ... })`.
   * Every incoming HTTP request triggers the callback function with two parameters:
     * `req` (IncomingMessage): Stream of incoming request details (URL, HTTP method, headers).
     * `res` (ServerResponse): Stream used to formulate and send back the HTTP response.
2. **Manual Route Matching**:
   * Without a framework, you must manually inspect `req.url` and `req.method`.
   * Stripping query parameters: `req.url.split("?")[0]` gives the clean path.
   * Matching logic:
     * If path matches and method matches $\to$ **`200 OK`** + execute handler.
     * If path matches but method does not $\to$ **`405 Method Not Allowed`**.
     * If path does not match any route $\to$ **`404 Not Found`**.
3. **Response Headers & Serialisation**:
   * `res.writeHead(statusCode, { 'Content-Type': 'application/json' })`: Tells the client the response body is JSON.
   * `res.end(JSON.stringify(body))`: Sends the stringified data and closes the HTTP stream.

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
const http = require('http');

// Pattern: Match routes systematically
function matchRoute(routes, method, url) {
  let pathMatched = false;

  for (const route of routes) {
    if (route.path === url) {
      pathMatched = true; // Path exists!
      if (route.method.toUpperCase() === method.toUpperCase()) {
        return { statusCode: 200, body: route.handler() };
      }
    }
  }

  // If path existed but method differed -> 405 Method Not Allowed
  if (pathMatched) {
    return { statusCode: 405, body: { error: "Method Not Allowed" } };
  }

  // If path was never found -> 404 Not Found
  return { statusCode: 404, body: { error: "Not Found" } };
}

// Pattern: Create server and wire the matcher
function createServer(routes) {
  return http.createServer((req, res) => {
    const pathname = req.url.split("?")[0]; // Strip query string
    const result = matchRoute(routes, req.method, pathname);

    res.writeHead(result.statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.body));
  });
}
```

### ❓ Why do we move to Express later?
> [!NOTE]
> Writing raw `http` servers requires dozens of lines just to match paths, check HTTP verbs, parse query strings, and stringify JSON. Express was built on top of `http` to replace all this boilerplate with intuitive methods like `app.get('/path', handler)`.

---

## 2. Assignment 2: File System (`fs`) & Path (`path`) Modules

📂 **File**: [assignment2.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class1/assignment2.js)

### 💡 Core Concepts
1. **Built-in `fs` (File System)**:
   * Enables interaction with the operating system's file system (reading, writing, checking existence, directory listing).
   * `fs.existsSync(dirPath)`: Synchronously checks if a given path exists on disk.
   * `fs.readdirSync(currentDir, { withFileTypes: true })`: Reads directory contents and returns `fs.Dirent` objects instead of plain strings.
2. **Built-in `path`**:
   * Solves cross-platform file path differences (Windows uses `\`, macOS/Linux use `/`).
   * `path.join(dir, file)`: Safely concatenates directory and file names.
   * `path.extname(filename)`: Extracts file extension including the dot (e.g., `.js`, `.png`).
   * `path.resolve(path)`: Resolves a relative path into an absolute file path.
3. **Recursive Directory Traversal (Tree Walk)**:
   * Directories can contain sub-directories to arbitrary depths.
   * A recursive helper function (`walk(currentDir)`) visits each folder, lists entries, and recursively calls itself if an entry is a directory (`entry.isDirectory()`).

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
const fs = require('fs');
const path = require('path');

function findFilesByExtension(dirPath, extension) {
  // 1. Guard clause: Ensure path exists
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const results = [];

  // 2. Recursive walker
  function walk(currentDir) {
    // withFileTypes: true gives Dirent objects with .isDirectory() and .isFile()
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath); // Recurse into subfolder
      } else if (
        entry.isFile() &&
        path.extname(entry.name).toLowerCase() === extension.toLowerCase()
      ) {
        results.push(path.resolve(fullPath)); // Store absolute path
      }
    }
  }

  walk(dirPath);
  return results.sort(); // Consistent alphabetical sorting
}
```

---

## 3. Assignment 3: Operating System (`os`) Module & System Health

📂 **File**: [assignment3.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class1/assignment3.js)

### 💡 Core Concepts
1. **Built-in `os`**:
   * Gives direct access to system hardware, memory, CPU, and operating system properties.
   * `os.totalmem()`: Total RAM in bytes.
   * `os.freemem()`: Unused RAM in bytes.
   * `os.uptime()`: Number of seconds the system has been continuously running.
   * `os.platform()`: OS identifier (e.g., `'darwin'`, `'linux'`, `'win32'`).
   * `os.cpus()`: Array of logical CPU cores.
   * `os.homedir()`: Path to the current user's home directory.
2. **Byte Conversions & Floating Point Rounding**:
   * Bytes $\to$ Kilobytes $\to$ Megabytes: Divide by $1024 \times 1024$.
   * Memory Usage Percentage: $\frac{\text{total} - \text{free}}{\text{total}} \times 100$.
   * `Number(val.toFixed(2))`: Limits decimal places to 2 digits and converts the resulting string back into a JavaScript number.

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
const os = require('os');

function getSystemHealth() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  // Convert bytes to MB
  const totalMemoryMB = Math.round(totalMemory / (1024 * 1024));
  const freeMemoryMB = Math.round(freeMemory / (1024 * 1024));

  // Calculate used percentage
  const usedMemoryPercent = Number(
    (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(2)
  );

  // Convert uptime seconds to hours
  const uptimeHours = Number((os.uptime() / 3600).toFixed(2));

  return {
    platform: os.platform(),
    cpuCores: os.cpus().length,
    totalMemoryMB,
    freeMemoryMB,
    usedMemoryPercent,
    uptimeHours,
    homeDir: os.homedir()
  };
}
```

---

# 🚀 Class 2: Express.js Fundamentals & API Design

Class 2 introduces **Express.js**, the industry-standard minimalist web framework for Node.js.

---

## 4. Assignment 4: Express Server Lifecycle, Middleware & Fallback 404

📂 **File**: [assignment4.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class2/assignment4.js)

### 💡 Core Concepts
1. **`express()` Application Factory**:
   * Initialises the Express app instance: `const app = express();`.
2. **Built-in Middleware `express.json()`**:
   * By default, Express cannot parse incoming JSON request bodies.
   * `app.use(express.json())` intercepts incoming requests, parses the JSON payload, and assigns it to `req.body`.
3. **Route Order Matters in Express**:
   * Express executes route handlers and middleware in the **exact order they are declared**.
   * Specific routes (`/`, `/health`) must be defined **before** the catch-all middleware.
4. **Catch-All 404 Handler**:
   * `app.use((req, res) => { res.status(404).json({ error: 'Not Found' }); })`.
   * Because it is placed at the end of the file with no specific route path, any request that did not match an earlier route will fall through into this handler.
5. **Server Listening**:
   * `app.listen(port)` starts the underlying HTTP server and binds to the specified port.

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
const express = require('express');

function createApp() {
  const app = express();

  // Step 1: Attach body parsing middleware
  app.use(express.json());

  // Step 2: Define specific routes
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the API' });
  });

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: Number(process.uptime().toFixed(2)) // Server uptime
    });
  });

  // Step 3: Catch-all 404 middleware (ALWAYS LAST)
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}

function startServer(app, port) {
  return app.listen(port);
}
```

---

## 5. Assignment 5: Route Parameters, Query Strings, Filtering & Field Projection

📂 **File**: [assignment5.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class2/assignment5.js)

### 💡 Core Concepts
1. **Route Parameters (`req.params`) vs. Query Parameters (`req.query`)**:
   * **Route Parameter (`/products/:id`)**: Identifies a specific resource. Accessed via `req.params.id`.
   * **Query Parameters (`/products?minPrice=100&fields=name,price`)**: Modifies, filters, or paginates the result set. Accessed via `req.query.minPrice`.
2. **Input Validation**:
   * Query and route parameters are parsed as **strings** by default.
   * `Number(req.query.minPrice)` converts them to numbers.
   * `Number.isFinite(val)` validates that the value is a valid, real number (not `NaN` or `Infinity`).
   * If invalid, immediately return **`400 Bad Request`**.
3. **Array Filtering**:
   * Using `.filter()` to apply conditional bounds (`product.price >= minPrice`).
4. **Field Projection (Selective Response Fields)**:
   * Clients often only need a subset of fields (e.g. `fields=name,price`) to save network bandwidth.
   * Split string by comma: `req.query.fields.split(',')`.
   * Construct a dynamic projection object including mandatory fields (e.g., `id`) and requested existing keys.

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
function registerProductRoutes(app, products) {

  // GET /products?minPrice=X&maxPrice=Y
  app.get('/products', (req, res) => {
    let result = products;

    if (req.query.minPrice !== undefined) {
      const minPrice = Number(req.query.minPrice);
      if (!Number.isFinite(minPrice)) {
        return res.status(400).json({ error: 'Invalid minPrice' });
      }
      result = result.filter(p => p.price >= minPrice);
    }

    if (req.query.maxPrice !== undefined) {
      const maxPrice = Number(req.query.maxPrice);
      if (!Number.isFinite(maxPrice)) {
        return res.status(400).json({ error: 'Invalid maxPrice' });
      }
      result = result.filter(p => p.price <= maxPrice);
    }

    return res.status(200).json(result);
  });

  // GET /products/:id?fields=name,price
  app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const product = products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Dynamic field projection
    if (req.query.fields !== undefined) {
      const fields = req.query.fields.split(',');
      const result = { id: product.id };

      for (const field of fields) {
        if (field in product && field !== 'id') {
          result[field] = product[field];
        }
      }
      return res.status(200).json(result);
    }

    return res.status(200).json(product);
  });
}
```

---

## 6. Assignment 6: Basic Query Parameters & Plain Text Responses

📂 **File**: [assignment6.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class2/assignment6.js)

### 💡 Core Concepts
* `req.query`: Holds key-value pairs from the URL search string (`/greet?name=Alice`).
* `res.send()`: Sends a plain text or HTML response (unlike `res.json()`, which formats data as a JSON payload).
* Providing graceful fallback values for optional inputs.

```javascript
const express = require("express");
const app = express();

app.get("/greet", (req, res) => {
  const name = req.query.name;
  if (name) {
    return res.send(`Hello, ${name}!`);
  }
  return res.send("Hello, Guest!");
});

module.exports = app;
```

---

# 🗄️ Class 3: Databases (MongoDB Driver & Mongoose ODM)

Class 3 introduces persistence using **MongoDB** (a NoSQL document database) and **Mongoose** (an Object Data Modeling library).

---

## 7. Assignment 6 (Class 3): Mongoose Setup, Schema Validation & CRUD

📂 **File**: [class3/assignment6.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class3/assignment6.js)

### 💡 Core Concepts
1. **Connecting to MongoDB via Mongoose**:
   * `mongoose.connect(connectionUri, options)` establishes an asynchronous connection pool to MongoDB.
2. **Schema vs. Model**:
   * **Schema**: The architectural blueprint defining allowed fields, data types, defaults, and validators (`required: true`, `min: 0`).
   * **Model**: A compiled JavaScript class backed by the schema that allows you to query, insert, update, and delete documents in a specific MongoDB collection.
3. **Async / Await & Try / Catch**:
   * All database queries return Promises.
   * Always wrap `await` calls in `try ... catch` blocks to gracefully catch and return database errors (`400 Bad Request` or `500 Internal Server Error`).
4. **CRUD Actions**:
   * `Product.find()`: Retrieves all documents from the collection.
   * `const product = new Product(req.body); await product.save();`: Validates and saves a new document.

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

// Step 1: Connect to Database
mongoose.connect("mongodb://localhost:27017/myApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Step 2: Define Schema (The Blueprint)
const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  price: { type: Number, min: 0 },
  specs: { type: Object },
});

// Step 3: Create Model
const Product = mongoose.model("product", productSchema);

// GET /products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /products
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## 8. Assignment 7: Lookup by ID with Mongoose (`findById`)

📂 **File**: [class3/assignment7.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class3/assignment7.js)

### 💡 Core Concepts
1. **`Model.findById(id)`**:
   * Mongoose automatically casts string IDs to MongoDB `ObjectId` types.
2. **Handling Non-Existent Resources (`404`)**:
   * `findById` resolves to `null` if no document matches the provided ID.
   * Always check `if (!user)` and return `404 Not Found`.
3. **Catching Server Exceptions (`500`)**:
   * Malformed ObjectId strings or network errors throw exceptions caught by the `catch` block.

```javascript
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
});
```

---

## 9. Assignment 8: Native MongoDB Driver & Singleton Connection Caching

📂 **File**: [class3/assignment8.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class3/assignment8.js)

### 💡 Core Concepts
1. **Native Driver vs. Mongoose**:
   * `mongodb` package provides direct, low-level access without the schema overhead of Mongoose.
2. **Why Singleton / Connection Caching is Essential**:
   * Opening a database connection is an expensive, slow network handshake.
   * If every incoming API request called `MongoClient.connect()`, the database server would quickly run out of sockets and crash.
   * **The Solution**: Maintain module-level variables (`let client = null; let db = null;`). If `db` already exists, return it immediately without reconnecting.
3. **Clean Teardown (`closeConnection`)**:
   * Important for unit testing and graceful server shutdown.

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
const { MongoClient } = require("mongodb");

let client = null;
let db = null;

/**
 * Connects once and reuses the cached database connection
 */
async function connectToDatabase(uri, dbName) {
  // 1. If connection already exists, reuse it!
  if (db) {
    return db;
  }

  // 2. Otherwise, initiate connection
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

/**
 * Accessor function ensuring connection is established
 */
function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase first.");
  }
  return db;
}

/**
 * Closes the active client and cleans up memory
 */
async function closeConnection() {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
}
```

---

## 10. Assignment 9: MongoDB Document Validation, Uniqueness & Batch Insertions

📂 **File**: [class3/assignment9.js](file:///Users/mdkaif/Desktop/MERN%20TA/assigmentSolution/class3/assignment9.js)

### 💡 Core Concepts
1. **Custom Error Classes (`class ValidationError extends Error`)**:
   * Allows error categorization so controllers can distinguish client validation mistakes (`400`) from internal database faults (`500`).
2. **Business Rule Validation**:
   * Checking non-empty strings (`userData.name.trim() === ""`).
   * Checking required characters (`email.includes("@")`).
3. **Duplicate Prevention**:
   * Single insert: Querying MongoDB with `findOne({ email })` before writing.
   * Batch insert (`createManyUsers`): Using a JavaScript `Set` to detect duplicate emails within the incoming batch in $\mathcal{O}(1)$ time before running the query.
4. **Native Driver Insertions**:
   * `db.collection("users").insertOne(doc)` $\to$ returns `{ insertedId }`.
   * `db.collection("users").insertMany(docs)` $\to$ returns `{ insertedIds: { 0: id1, 1: id2 } }`.

### 🔍 Code Walkthrough & Generalized Pattern

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateUser(userData) {
  if (!userData || typeof userData.name !== "string" || userData.name.trim() === "") {
    throw new ValidationError("Invalid name");
  }
  if (typeof userData.email !== "string" || !userData.email.includes("@")) {
    throw new ValidationError("Invalid email");
  }
}

async function createUser(db, userData) {
  validateUser(userData);

  // Check for uniqueness in DB
  const existing = await db.collection("users").findOne({ email: userData.email });
  if (existing) {
    throw new ValidationError("Email already exists");
  }

  const doc = {
    name: userData.name,
    email: userData.email,
    age: userData.age ?? null, // Nullish coalescing for optional fields
    createdAt: new Date()
  };

  const result = await db.collection("users").insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function createManyUsers(db, usersArray) {
  const emails = new Set();

  // Validate entire batch and check in-memory duplicates
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
```

---

## 🎯 Quick Reference Cheat Sheet for Juniors

| Goal | Technique / Function | Key Caveat / Best Practice |
| :--- | :--- | :--- |
| **Create HTTP Server** | `http.createServer((req, res) => ...)` | Must parse `req.url.split('?')[0]` and call `res.end()` |
| **Read Folders Recursively** | `fs.readdirSync(dir, { withFileTypes: true })` | Always use `entry.isDirectory()` and `path.join()` |
| **Get OS Info / Memory** | `os.totalmem()`, `os.freemem()` | Divide bytes by `(1024 * 1024)` for Megabytes |
| **Read JSON Body in Express** | `app.use(express.json())` | Must be registered **before** your route definitions |
| **Catch 404 in Express** | `app.use((req, res) => ...)` | Must be placed at the **very bottom** of your file |
| **Route vs Query Params** | `req.params` (`/items/:id`) vs `req.query` (`/items?sort=asc`) | Values are strings; convert with `Number()` and check `Number.isFinite()` |
| **Database Connection** | `mongoose.connect(URI)` | Always wrap database operations in `try ... catch` |
| **Query Single Document** | `Model.findById(id)` or `collection.findOne()` | Always check `if (!doc)` and return `404 Not Found` |
| **Cache DB Client** | Store `db` in module-level variable | Return existing `db` if present to avoid socket exhaustion |

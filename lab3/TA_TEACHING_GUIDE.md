Absolutely. Since this is a **student evaluation rubric**, below is a complete reference implementation you can use to check whether a student has actually implemented each section, followed by **easy → medium viva questions with answers**.

I'll assume the stack is **MongoDB + Express + React**.

---

# 1. Create Product Model — 15 Marks

### `models/Product.js`

```js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0.01,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
```

### What to check for marks

| Requirement | Marks |
|---|---:|
| `name` required | |
| `description` required | |
| `category` required | |
| `image` required | |
| `price > 0` | |
| `stock >= 0` | |
| `createdAt` automatically generated | |
| Proper Mongoose schema/model | **15** |

The important part is:

```js
min: 0.01
```

for price and:

```js
min: 0
```

for stock.

`timestamps: true` automatically creates:

```text
createdAt
updatedAt
```

---

# 2. Create Product API — 10 Marks

### `controllers/productController.js`

```js
const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate stock
    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
};
```

### Route

```js
const express = require("express");
const router = express.Router();

const {
  createProduct,
} = require("../controllers/productController");

router.post("/products", createProduct);

module.exports = router;
```

### Test request

```http
POST /products
Content-Type: application/json
```

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/keyboard.jpg",
  "stock": 10
}
```

Expected:

```text
Status: 201
```

### Student should demonstrate

**Valid request:**

```text
201 Created
```

**Missing field:**

```text
400 Bad Request
```

**price = -100:**

```text
400 Bad Request
```

**stock = -5:**

```text
400 Bad Request
```

---

# 3. Get All Products API — 10 Marks

Add this controller:

```js
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

Export:

```js
module.exports = {
  createProduct,
  getAllProducts,
};
```

Route:

```js
router.get("/products", getAllProducts);
```

Request:

```http
GET /products
```

Response:

```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "_id": "66d123...",
      "name": "Mechanical Keyboard",
      "price": 2999,
      "category": "Electronics",
      "image": "https://example.com/keyboard.jpg",
      "stock": 10
    }
  ]
}
```

### What to check

- Correct endpoint
- Fetches from MongoDB
- Returns array
- Returns count
- Correct JSON structure
- Handles errors

---

# 4. Get Single Product API — 5 Marks

```js
const mongoose = require("mongoose");

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

Route:

```js
router.get("/products/:id", getSingleProduct);
```

### Two important cases

Invalid ID:

```text
GET /products/hello
```

→ `400`

Valid ID but product doesn't exist:

```text
GET /products/66d123abc456...
```

→ `404`

---

# 5. Search & Category Filtering — 10 Marks

This is where students should extend the existing `GET /products`.

Replace `getAllProducts` with:

```js
const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

### Search

```http
GET /products?search=keyboard
```

MongoDB effectively searches:

```js
{
  name: {
    $regex: "keyboard",
    $options: "i"
  }
}
```

So:

```text
Keyboard
keyboard
KEYBOARD
KeYbOaRd
```

can all match.

### Category

```http
GET /products?category=Electronics
```

### Both

```http
GET /products?search=keyboard&category=Electronics
```

The resulting filter becomes approximately:

```js
{
  name: {
    $regex: "keyboard",
    $options: "i"
  },
  category: "Electronics"
}
```

MongoDB applies both conditions.

---

# 6. Product Listing Page — 15 Marks

Now React.

### `Products.jsx`

```jsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/products"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <h2>Loading products...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (products.length === 0) {
    return <h2>No products found</h2>;
  }

  return (
    <div>
      <h1>Products</h1>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
```

---

# 7. Product Card

### `ProductCard.jsx`

```jsx
const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
      />

      <h2>{product.name}</h2>

      <p>{product.description}</p>

      <p>₹{product.price}</p>

      <p>Category: {product.category}</p>

      <p>
        {product.stock > 0
          ? `In Stock (${product.stock})`
          : "Out of Stock"}
      </p>

      <button>
        View Details
      </button>
    </div>
  );
};

export default ProductCard;
```

### Marks should check

Each card should dynamically show:

- Image
- Name
- Price
- Category
- Stock status
- View Details

And especially:

```jsx
products.map(...)
```

rather than:

```jsx
<ProductCard ... />
<ProductCard ... />
<ProductCard ... />
```

with manually entered products.

---

# 8. React Routing

If using React Router:

```bash
npm install react-router-dom
```

### `App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

Now:

```text
http://localhost:5173/products
```

opens the product listing page.

---

# 9. Search & Filter UI — 10 Marks

Update `Products.jsx`.

```jsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (category) {
        params.append("category", category);
      }

      const url = `http://localhost:5000/products?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  return (
    <div>
      <h1>Products</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Books">Books</option>
      </select>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found.</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
```

The important flow for viva is:

```text
User types
   ↓
onChange()
   ↓
setSearch()
   ↓
search state changes
   ↓
useEffect()
   ↓
fetchProducts()
   ↓
GET /products?search=...
   ↓
MongoDB filtering
   ↓
setProducts()
   ↓
React re-renders
```

---

# 10. Bonus — Sorting — 10 Marks

Backend:

```js
const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      sort,
    } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    let query = Product.find(filter);

    if (sort === "price_asc") {
      query = query.sort({ price: 1 });
    }

    if (sort === "price_desc") {
      query = query.sort({ price: -1 });
    }

    const products = await query;

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

### Requests

Low → high:

```http
GET /products?sort=price_asc
```

High → low:

```http
GET /products?sort=price_desc
```

And sorting can work with filtering:

```http
GET /products?search=phone&category=Electronics&sort=price_asc
```

---

# 11. Complete Route File

For evaluation, the student's routes should ultimately look roughly like:

```js
const express = require("express");

const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/productController");

router.post("/products", createProduct);

router.get("/products", getAllProducts);

router.get("/products/:id", getSingleProduct);

module.exports = router;
```

And in `server.js`:

```js
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

app.use(productRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error(error);
  });
```

---

# Viva Questions — Easy → Medium

## 🟢 Easy Level

### 1. What is MongoDB?

**Answer:**  
MongoDB is a NoSQL database that stores data in document format, similar to JSON.

---

### 2. What is Mongoose?

**Answer:**  
Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js. It allows us to define schemas, models, validations, and interact with MongoDB more easily.

---

### 3. What is a schema?

**Answer:**  
A schema defines the structure and validation rules of documents stored in a MongoDB collection.

Example:

```js
const productSchema = new mongoose.Schema({
  name: String,
  price: Number
});
```

---

### 4. What is a model?

**Answer:**  
A model is created from a Mongoose schema and is used to perform database operations such as creating, finding, updating, and deleting documents.

```js
const Product = mongoose.model("Product", productSchema);
```

---

### 5. What does `required: true` mean?

**Answer:**  
It means the field must be provided when creating the document.

```js
name: {
  type: String,
  required: true
}
```

---

### 6. Why do we use `min` for price?

**Answer:**  
To prevent invalid values.

```js
price: {
  type: Number,
  min: 0.01
}
```

This ensures the price cannot be zero or negative.

---

### 7. What does `timestamps: true` do?

**Answer:**  
It automatically adds:

```text
createdAt
updatedAt
```

to the document.

---

### 8. What is an API?

**Answer:**  
An API is an interface through which different software components communicate. Here, React communicates with our Express backend through HTTP APIs.

---

### 9. What is a REST API?

**Answer:**  
A REST API uses HTTP methods and resource-based URLs to perform operations on data.

For example:

```text
POST /products
GET /products
GET /products/:id
```

---

### 10. Difference between GET and POST?

**Answer:**

`GET` is generally used to retrieve data.

```http
GET /products
```

`POST` is generally used to send data to the server to create a resource.

```http
POST /products
```

---

# 🟡 Easy-Medium

### 11. What is `req.body`?

**Answer:**  
`req.body` contains data sent by the client in the request body.

For example:

```json
{
  "name": "Keyboard",
  "price": 2999
}
```

We access it using:

```js
req.body.name
req.body.price
```

---

### 12. What is `req.params`?

**Answer:**  
`req.params` contains parameters from the URL.

For:

```http
GET /products/123
```

and:

```js
router.get("/products/:id", ...)
```

we get:

```js
req.params.id
```

which is:

```text
123
```

---

### 13. What is `req.query`?

**Answer:**  
It contains query parameters.

For:

```http
GET /products?search=phone&category=Electronics
```

we get:

```js
req.query.search
```

→ `"phone"`

and:

```js
req.query.category
```

→ `"Electronics"`

---

### 14. Difference between params and query?

**Answer:**

URL parameter:

```http
/products/123
```

is accessed using:

```js
req.params.id
```

Query parameter:

```http
/products?search=phone
```

is accessed using:

```js
req.query.search
```

---

### 15. What is HTTP status code 201?

**Answer:**  
`201 Created` indicates that a new resource was successfully created.

We use it after:

```http
POST /products
```

---

### 16. What is HTTP 400?

**Answer:**  
`400 Bad Request` means the client sent an invalid request.

For example:

```text
price = -500
```

---

### 17. What is HTTP 404?

**Answer:**  
`404 Not Found` means the requested resource doesn't exist.

For example:

```http
GET /products/<valid-but-nonexistent-id>
```

---

### 18. Why do we check ObjectId validity?

```js
mongoose.Types.ObjectId.isValid(id)
```

**Answer:**  
Because MongoDB expects a valid ObjectId format. Checking first allows us to return a controlled `400 Bad Request` instead of relying on a database casting error.

---

### 19. What does `$regex` do?

**Answer:**  
`$regex` performs pattern-based matching in MongoDB.

```js
{
  name: {
    $regex: "phone"
  }
}
```

can find names containing `"phone"`.

---

### 20. Why use `$options: "i"`?

**Answer:**  
`i` makes the regular expression case-insensitive.

So:

```text
phone
Phone
PHONE
pHoNe
```

can all match.

---

# 🟠 Medium Level

### 21. How does combined filtering work?

**Answer:**

For:

```http
GET /products?search=phone&category=Electronics
```

we construct:

```js
const filter = {};

if (search) {
  filter.name = {
    $regex: search,
    $options: "i"
  };
}

if (category) {
  filter.category = category;
}
```

MongoDB receives both conditions and returns products satisfying both.

---

### 22. Why do we use `if (search)`?

**Answer:**  
Because search is optional.

If the user requests:

```http
GET /products
```

we don't want to add a search condition.

If they request:

```http
GET /products?search=phone
```

then we add the search condition.

---

### 23. What happens when there are no products?

**Answer:**  
The backend can return:

```json
{
  "success": true,
  "count": 0,
  "products": []
}
```

The frontend should display an appropriate empty state such as:

```text
No products found.
```

---

### 24. Why should product cards not be hardcoded?

**Answer:**  
Because the products are stored in the database and can change. The frontend should dynamically render whatever products the backend returns.

```jsx
products.map(product => (
  <ProductCard
    key={product._id}
    product={product}
  />
))
```

---

### 25. Why do we use `key` in `.map()`?

```jsx
products.map(product => (
  <ProductCard key={product._id} />
))
```

**Answer:**  
React uses the key to identify individual elements in a list and efficiently update the DOM when the list changes.

---

### 26. What is `useState`?

**Answer:**  
`useState` is a React hook used to store and update component state.

```js
const [products, setProducts] = useState([]);
```

Here:

```text
products     → current state
setProducts  → function to update it
```

---

### 27. What is `useEffect`?

**Answer:**  
`useEffect` is a React hook used for side effects such as API calls.

```js
useEffect(() => {
  fetchProducts();
}, []);
```

With an empty dependency array, this effect runs after the component's initial render.

---

### 28. Why use `useEffect` for fetching products?

**Answer:**  
Fetching data from an API is a side effect. `useEffect` provides a place to perform that operation after rendering.

---

### 29. What happens when search state changes?

**Answer:**

```text
User types "phone"
       ↓
onChange()
       ↓
setSearch("phone")
       ↓
search state changes
       ↓
useEffect runs
       ↓
API request
       ↓
Backend searches MongoDB
       ↓
Products state updates
       ↓
UI re-renders
```

---

### 30. What is `URLSearchParams`?

**Answer:**  
It is a browser API that helps construct URL query parameters.

```js
const params = new URLSearchParams();

params.append("search", "phone");
params.append("category", "Electronics");
```

It generates:

```text
search=phone&category=Electronics
```

---

# 🔴 Medium / Good Viva Questions

### 31. Why filter on the backend instead of fetching everything and filtering in React?

**Answer:**  
Backend filtering allows MongoDB to perform the filtering and avoids sending unnecessary products over the network. It becomes especially important when the database contains many products.

---

### 32. What does this mean?

```js
Product.find(filter)
```

**Answer:**  
It asks MongoDB to find all documents from the Product collection that match the specified filter.

---

### 33. What does this do?

```js
Product.findById(id)
```

**Answer:**  
It searches for a single product using its MongoDB `_id`.

---

### 34. What does this do?

```js
Product.find(filter).sort({ price: 1 })
```

**Answer:**  
It finds products matching the filter and sorts them by price in ascending order.

```text
1 → ascending
-1 → descending
```

---

### 35. How would you implement price sorting?

**Answer:**

```js
if (sort === "price_asc") {
  query = query.sort({ price: 1 });
}

if (sort === "price_desc") {
  query = query.sort({ price: -1 });
}
```

---

### 36. What is middleware in Express?

**Answer:**  
Middleware is a function that executes during the request-response cycle.

For example:

```js
app.use(express.json());
```

allows Express to parse JSON request bodies.

---

### 37. Why do we need `express.json()`?

**Answer:**  
It parses incoming JSON request bodies and makes the data available through:

```js
req.body
```

Without it, JSON data sent by the client may not be available in the expected form.

---

### 38. Why do we use `async/await` here?

```js
const products = await Product.find();
```

**Answer:**  
Database operations are asynchronous. `await` allows us to wait for the database operation to complete before continuing execution, while `async` allows the function to use `await`.

---

### 39. Why use `try/catch`?

**Answer:**  
Database operations and API calls can fail. `try/catch` lets us handle errors and send an appropriate HTTP response instead of crashing the request handler.

---

### 40. What is the difference between 400 and 404?

**Answer:**

**400 — Bad Request**

The request itself is invalid.

Example:

```text
Invalid product ID
```

**404 — Not Found**

The request is valid, but the requested resource doesn't exist.

Example:

```text
Valid ObjectId but no product exists with that ID
```

---

# ⭐ Questions You Can Ask to Quickly Verify Whether the Student Actually Understands the Code

These are particularly useful during evaluation.

### Q1. "Explain this line."

```js
$options: "i"
```

Expected:

> It makes the regex case-insensitive.

---

### Q2. "If I call this API, what will `req.query` contain?"

```http
GET /products?search=laptop&category=Electronics
```

Expected:

```js
{
  search: "laptop",
  category: "Electronics"
}
```

---

### Q3. "What will happen if I send this?"

```json
{
  "name": "Laptop",
  "price": -500,
  "category": "Electronics",
  "image": "abc",
  "stock": 5
}
```

Expected:

> It should be rejected because price must be greater than zero, returning `400`.

---

### Q4. "What is the difference between these?"

```text
/products/123
```

and:

```text
/products?id=123
```

Expected:

> `123` in the first URL is a route parameter accessed through `req.params.id`. In the second URL it is a query parameter accessed through `req.query.id`.

---

### Q5. "Why is this necessary?"

```jsx
key={product._id}
```

Expected:

> React needs a stable key to identify elements in a list efficiently.

---

### Q6. "If the database contains 10,000 products, should React fetch all 10,000 and search them?"

Expected:

> No. The search should be handled by the backend/database so only the relevant results are returned.

---

### Q7. "What happens if `Product.findById(id)` returns `null`?"

Expected:

```js
if (!product) {
  return res.status(404).json({
    message: "Product not found"
  });
}
```

---

### Q8. "What happens if I remove `$options: 'i'`?"

Expected:

> The search becomes case-sensitive, depending on the regex/query behavior.

---

### Q9. "Why do we use `201` instead of `200` after creating a product?"

Expected:

> `201 Created` specifically indicates that a new resource has been successfully created.

---

### Q10. "Explain the complete flow when I type `phone` in the search box."

A strong student should be able to say:

> The input's `onChange` handler updates the React `search` state. Since `search` is a dependency of `useEffect`, the effect runs and sends a request such as `GET /products?search=phone`. Express reads `req.query.search`, creates a MongoDB regex filter, retrieves matching products, returns them as JSON, React updates the `products` state, and the product cards are re-rendered using `.map()`.

That last question is a **very good discriminator** between someone who copied the code and someone who understands the entire application.
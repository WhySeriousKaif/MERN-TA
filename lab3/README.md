# 🛒 Engineering Lab 03 — Fullstack Engineering Lab
# ShopKart: Product Catalog & Discovery

> **Duration:** 2 Hours  
> **Mode:** Individual Lab  
> **Total Marks:** 100 (+10 Bonus Challenge)  
> **Ecosystem:** Continuation of ShopKart Lab 01 & Lab 02  

---

## 📖 The Story

ShopKart's authentication system (Lab 01 & Lab 02) is active and customers can successfully register and sign into the application.

Now comes the core shopping experience: **Product Discovery**. Customers need to browse products dynamically, search for specific gear, filter by category, sort by price, view individual product pages with rich details, and see clean feedback during loading or empty searches.

---

## 🏗️ Architecture & Project Structure

This project follows MVC architecture for the backend and a modular service-oriented structure for the React frontend.

```text
lab3/
├── backend/
│   ├── .env                      # Server configuration (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json              # Express, Mongoose, bcrypt, jsonwebtoken, cors
│   ├── index.js                  # App bootstrap, CORS with credentials, route mounting
│   ├── models/
│   │   ├── product.model.js      # [Task 1] Product Schema with validation
│   │   └── customer.model.js     # Customer auth schema (Lab 01/02 continuity)
│   ├── controllers/
│   │   ├── product.controller.js # [Tasks 2, 3, 4, 5 & Bonus] Business logic & queries
│   │   └── customer.controller.js# Auth handlers (register, login, me, logout)
│   ├── routes/
│   │   ├── product.routes.js     # POST /products, GET /products, GET /products/:id
│   │   └── customer.routes.js    # Auth routes (/customers/...)
│   ├── middlewares/
│   │   └── auth.middleware.js    # Protects endpoints with HttpOnly cookie JWT
│   ├── utils/
│   │   └── generateToken.js      # Signs JWT token
│   └── seed.js                   # Populates 12 sample products across categories
│
├── frontend/
│   ├── .env                      # VITE_API_URL=http://localhost:5001
│   ├── index.html                # App root with Outfit & Inter Google fonts
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # React 18, React Router v6, Axios
│   └── src/
│       ├── main.jsx              # DOM entrypoint
│       ├── App.jsx               # React Router config: /products, /products/:id, /home
│       ├── index.css             # High-contrast, responsive CSS design system
│       ├── components/
│       │   ├── Navbar.jsx        # Navigation header with active links & user auth state
│       │   ├── ProductCard.jsx   # [Task 6] Image, name, ₹ price, category, stock badge
│       │   └── SearchBar.jsx     # [Task 7] Search bar, Category dropdown, Sort dropdown
│       ├── pages/
│       │   ├── Products.jsx      # [Task 6 & 7] Catalog with Loading, Error, Empty states
│       │   ├── ProductDetails.jsx# [Task 8] Single product details & Add to Cart button
│       │   ├── Home.jsx          # Protected customer dashboard with quick catalog link
│       │   ├── Login.jsx         # Sign in page
│       │   └── Register.jsx      # Registration page
│       └── services/
│           ├── api.js            # Centralized Axios client with withCredentials: true
│           └── productService.js # Abstracted API service functions
│
├── README.md                     # This documentation
└── TA_TEACHING_GUIDE.md          # 100-mark TA grading rubric & Viva examination guide
```

---

## ⚡ Quick Start & Setup

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
mongod
# or if using Homebrew on macOS:
brew services start mongodb-community
```

### 2. Setup & Seed the Backend
```bash
cd lab3/backend

# Install dependencies
npm install

# Seed sample products into MongoDB
npm run seed
# Output: Successfully seeded 12 products!

# Start backend server
npm run dev
# Running on http://localhost:5001
```

### 3. Setup & Start the Frontend
In a new terminal:
```bash
cd lab3/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Running on http://localhost:5173
```

Now open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📡 API Reference & Verification (cURL)

### 1. Create Product (`POST /products`) — Task 2
```bash
curl -X POST http://localhost:5001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "RGB Mechanical Keyboard",
    "description": "Tactile blue switches with customizable backlight",
    "price": 2999,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1595225476474-87563907a212",
    "stock": 15
  }'
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "66f...",
    "name": "RGB Mechanical Keyboard",
    "price": 2999,
    "category": "Electronics",
    "stock": 15
  }
}
```

#### Validation Error Cases (`400 Bad Request`):
- Missing field: `{"name": "Keyboard"}` $\to$ Status 400
- Invalid price: `{"price": -10}` $\to$ Status 400
- Invalid stock: `{"stock": -5}` $\to$ Status 400

---

### 2. Get All Products (`GET /products`) — Task 3
```bash
curl http://localhost:5001/products
```
**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "count": 12,
  "products": [
    {
      "_id": "66f...",
      "name": "RGB Mechanical Keyboard",
      "price": 2999,
      "category": "Electronics",
      "image": "https://...",
      "stock": 15
    }
  ]
}
```

---

### 3. Search & Filtering — Task 5
- **Search by name (case-insensitive):**
  ```bash
  curl "http://localhost:5001/products?search=keyboard"
  ```
- **Filter by category:**
  ```bash
  curl "http://localhost:5001/products?category=Electronics"
  ```
- **Combined Search & Category:**
  ```bash
  curl "http://localhost:5001/products?search=watch&category=Electronics"
  ```

---

### 4. Bonus Challenge: Sorting (+10 Marks)
- **Sort by price ascending (Low to High):**
  ```bash
  curl "http://localhost:5001/products?sort=price_asc"
  ```
- **Sort by price descending (High to Low):**
  ```bash
  curl "http://localhost:5001/products?sort=price_desc"
  ```

---

### 5. Get Single Product (`GET /products/:id`) — Task 4
```bash
curl http://localhost:5001/products/<VALID_OBJECT_ID>
```
**Failure Cases:**
- Invalid MongoDB ObjectId format:
  ```bash
  curl http://localhost:5001/products/123invalid
  # Status 400 Bad Request
  ```
- Non-existent valid ObjectId:
  ```bash
  curl http://localhost:5001/products/66d123abc456000000000000
  # Status 404 Not Found
  ```

---

## 🖥️ Frontend Features & Routes

| Route | Component | Purpose |
|---|---|---|
| `/products` | `Products.jsx` | Dynamic catalog, search, category filter, sort, and loading/error/empty states |
| `/products/:id` | `ProductDetails.jsx` | Single product details with large image, description, price, stock, and Add to Cart UI |
| `/home` | `Home.jsx` | Customer profile dashboard with link to explore products |
| `/login` | `Login.jsx` | Authenticates customer and sets HttpOnly cookie |
| `/register` | `Register.jsx` | Creates a new customer account |

---

## 🧪 UI State Testing Instructions

1. **Loading State**: Open Network tab in Chrome DevTools $\to$ Throttle to "Slow 3G" $\to$ Refresh `/products`. Notice the centered animated spinner and `"Loading products..."`.
2. **Empty State**: In the search bar on `/products`, type `zzzznonexistent` $\to$ The UI immediately shows `"No products found."` with an option to clear filters.
3. **Error State**: Stop the backend server (`Ctrl + C`) $\to$ Click "Retry Request" on `/products` $\to$ Notice the clear `"Something went wrong while loading products."` banner.
4. **Product Details**: Click "View Details" on any product card $\to$ Route navigates to `/products/:id` $\to$ Full specifications, large image, quantity selector, and "Add to Cart" button appear.

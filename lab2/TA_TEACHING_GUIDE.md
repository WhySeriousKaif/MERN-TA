Yes. This is another **student evaluation rubric**, this time for **Authentication: Registration + Login + Protected Page + Logout**.

There is one formatting issue in the table: the marks appear shifted across columns. Based on the rubric text, the intended total is:

- **Registration — 25**
- **Login — 30**
- **Protected Page & Logout — 15**
- **Viva — 30**
- **Total — 100**

Below is a **complete reference implementation** you can use for marking students, followed by **easy → medium viva questions with answers**.

---

# 1. Recommended Project Structure

```text
project/
│
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   └── .env
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Register.jsx
        │   ├── Login.jsx
        │   └── Home.jsx
        ├── App.jsx
        └── main.jsx
```

We'll use:

```text
React
Express
MongoDB
Mongoose
bcryptjs
jsonwebtoken
cookie-parser
```

---

# 2. Backend Setup

Install:

```bash
npm install express mongoose bcryptjs jsonwebtoken cookie-parser cors dotenv
```

---

# 3. User Model

### `models/User.js`

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
```

### What to check

Students should have:

- Full name
- Email
- Password
- Phone number
- Required validation
- Unique email

---

# 4. Registration API

A reasonable endpoint:

```http
POST /api/auth/register
```

Request:

```json
{
  "fullName": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "password": "password123",
  "phoneNumber": "9876543210"
}
```

---

## `authController.js`

```js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
    } = req.body;

    // Check required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !phoneNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
};
```

---

# 5. Registration Route

### `routes/authRoutes.js`

```js
const express = require("express");

const {
  register,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

module.exports = router;
```

---

# 6. Why `bcrypt`?

This is a very important viva question.

We should **never store the user's plain password** like:

```json
{
  "password": "password123"
}
```

Instead:

```text
password123
      ↓
bcrypt.hash()
      ↓
$2b$10$......
      ↓
MongoDB
```

Example:

```js
const hashedPassword = await bcrypt.hash(
  password,
  10
);
```

The `10` represents the bcrypt cost factor / salt rounds.

---

# 7. Registration Frontend

### `Register.jsx`

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setSuccess("Registration successful");

      navigate("/login");
    } catch (error) {
      setError("Something went wrong");
    }
  };

  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
        />

        <button type="submit">
          Create Account
        </button>

      </form>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </div>
  );
};

export default Register;
```

---

# 8. Registration Marks — 25

For evaluation, I would break the 25 marks like this:

| Requirement | Marks |
|---|---:|
| Full Name field | 2 |
| Email field | 2 |
| Password field | 2 |
| Phone Number field | 2 |
| Create Account button | 2 |
| Controlled components | 5 |
| Validation/errors | 5 |
| API integration | 3 |
| Redirect to login after success | 2 |
| **Total** | **25** |

---

# 9. What Is a Controlled Component?

Very important viva topic.

This is a controlled input:

```jsx
<input
  name="email"
  value={formData.email}
  onChange={handleChange}
/>
```

React controls the input's value.

The state is:

```js
const [formData, setFormData] = useState({
  email: "",
});
```

When the user types:

```text
a
```

the state becomes:

```text
email: "a"
```

Then:

```text
React state
    ↓
Input value
```

---

# 10. Login API

Endpoint:

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "rahul@gmail.com",
  "password": "password123"
}
```

---

## Login Controller

```js
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Compare password
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

Update exports:

```js
module.exports = {
  register,
  login,
};
```

And route:

```js
router.post("/login", login);
```

---

# 11. Why Use Cookies?

The rubric specifically says:

> Send credentials with cookies.

The important concept is that after successful login, the server creates a JWT and sends it as a cookie:

```text
Login
  ↓
Email + Password
  ↓
Backend verifies
  ↓
JWT generated
  ↓
JWT stored in cookie
  ↓
Browser automatically sends cookie
  ↓
Protected API
```

With:

```js
httpOnly: true
```

JavaScript running in the browser cannot directly read the cookie.

---

# 12. Login Frontend

### `Login.jsx`

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError("Invalid Credentials");
        return;
      }

      navigate("/home");

    } catch (error) {
      setError("Something went wrong");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button type="submit">
          Login
        </button>

      </form>

      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
```

---

# 13. Important: `credentials: "include"`

This is likely to be asked in viva.

```js
credentials: "include"
```

tells the browser that cookies should be included in the cross-origin request.

Without it, your frontend may successfully call:

```http
POST /login
```

but the browser may not send/store cookies as intended in a cross-origin setup.

---

# 14. CORS Configuration

Because React and Express may run on different ports:

```text
React     → localhost:5173
Express   → localhost:5000
```

configure CORS.

### `server.js`

```js
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
```

The important part:

```js
credentials: true
```

must work together with:

```js
credentials: "include"
```

on the frontend.

---

# 15. JWT Authentication Middleware

Create:

### `middleware/authMiddleware.js`

```js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = authMiddleware;
```

---

# 16. Protected Home API

Add:

```js
const getMe = async (req, res) => {
  try {
    const user = await User.findById(
      req.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
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
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/me",
  authMiddleware,
  getMe
);
```

Notice:

```js
authMiddleware
```

comes before:

```js
getMe
```

So the request must pass authentication first.

---

# 17. Protected Page

### `Home.jsx`

```jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          navigate("/login");
          return;
        }

        const data = await response.json();

        setUser(data.user);

      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>
        Welcome, {user.fullName}
      </h1>

      <p>Email: {user.email}</p>

      <p>
        Phone: {user.phoneNumber}
      </p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Home;
```

We need the logout function:

```js
const handleLogout = async () => {
  try {
    await fetch(
      "http://localhost:5000/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );

    navigate("/login");

  } catch (error) {
    console.error(error);
  }
};
```

---

# 18. Logout API

Backend:

```js
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
```

Route:

```js
router.post("/logout", logout);
```

---

# 19. Complete Authentication Flow

This is the **most important concept for viva**.

```text
                 REGISTRATION

React Register Form
        ↓
POST /register
        ↓
Express
        ↓
Validate fields
        ↓
Check existing email
        ↓
bcrypt.hash(password)
        ↓
Save user to MongoDB
        ↓
201 Created
        ↓
Navigate → /login
```

Then:

```text
                    LOGIN

React Login Form
        ↓
POST /login
        ↓
Express
        ↓
Find user by email
        ↓
bcrypt.compare()
        ↓
Password correct?
      /       \
    No         Yes
    ↓           ↓
401          jwt.sign()
                ↓
          Set Cookie
                ↓
             200 OK
                ↓
         Navigate /home
```

Then:

```text
                   PROTECTED PAGE

GET /me
   +
Cookie: token
      ↓
authMiddleware
      ↓
jwt.verify()
      ↓
Extract userId
      ↓
Find user
      ↓
Return user information
      ↓
React displays:
Welcome
Name
Email
Phone
```

Logout:

```text
Click Logout
     ↓
POST /logout
     ↓
clearCookie("token")
     ↓
Navigate /login
```

---

# 20. React Routes

### `App.jsx`

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

# 21. Marking Breakdown

## Registration — 25

| Requirement | Marks |
|---|---:|
| Full Name | 2 |
| Email | 2 |
| Password | 2 |
| Phone Number | 2 |
| Create Account button | 2 |
| Controlled components | 5 |
| Validation/error handling | 5 |
| API integration | 3 |
| Redirect to login | 2 |
| **Total** | **25** |

---

# Login — 30

| Requirement | Marks |
|---|---:|
| Email field | 5 |
| Password field | 5 |
| Login button | 5 |
| Controlled components | 5 |
| Send credentials/cookies | 5 |
| Invalid Credentials handling | 3 |
| Redirect to `/home` | 2 |
| **Total** | **30** |

---

# Protected Page + Logout — 15

| Requirement | Marks |
|---|---:|
| Protected API/page | 3 |
| Welcome message | 2 |
| Customer name | 2 |
| Email | 2 |
| Phone number | 2 |
| Logout button/function | 2 |
| Cookie cleared | 1 |
| Redirect to login | 1 |
| **Total** | **15** |

---

# Viva — 30

I'd ask **6 questions × 5 marks** or **10 questions × 3 marks**, depending on your evaluation style.

Below is a large question bank.

---

# 🟢 EASY VIVA

### 1. What is authentication?

**Answer:**

Authentication is the process of verifying the identity of a user.

For example:

```text
Email + Password
       ↓
Verify user
       ↓
Authenticated
```

---

### 2. What is authorization?

**Answer:**

Authorization determines what an authenticated user is allowed to access.

Example:

```text
Authentication:
"Who are you?"

Authorization:
"What are you allowed to access?"
```

---

### 3. Why do we hash passwords?

**Answer:**

We hash passwords so that the original password is not stored directly in the database.

Instead of:

```text
password123
```

we store a bcrypt hash.

---

### 4. What is bcrypt?

**Answer:**

bcrypt is a password-hashing library commonly used to securely hash passwords and compare passwords during login.

---

### 5. What is JWT?

**Answer:**

JWT stands for **JSON Web Token**. It is a signed token that can represent information about an authenticated user.

---

### 6. What is a cookie?

**Answer:**

A cookie is a small piece of data stored by the browser and associated with a website. It can be sent automatically with requests to that website.

---

### 7. What is `httpOnly`?

```js
httpOnly: true
```

**Answer:**

It prevents client-side JavaScript from directly accessing the cookie.

This can help reduce the impact of certain XSS attacks involving cookie theft.

---

### 8. What is `req.body`?

**Answer:**

It contains data sent by the client in the request body.

Example:

```js
req.body.email
```

---

### 9. What is `req.cookies`?

**Answer:**

It contains cookies sent by the browser, provided that `cookie-parser` middleware has been configured.

```js
req.cookies.token
```

---

### 10. Why do we use `cookie-parser`?

**Answer:**

It parses cookies from incoming HTTP requests and makes them accessible through:

```js
req.cookies
```

---

# 🟡 EASY-MEDIUM

### 11. What is a controlled component?

**Answer:**

A controlled component is a form input whose value is controlled by React state.

Example:

```jsx
<input
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
/>
```

---

### 12. Why use `preventDefault()`?

```js
e.preventDefault();
```

**Answer:**

It prevents the browser's default form submission behavior, allowing React to handle the submission through JavaScript.

---

### 13. Why do we use `credentials: "include"`?

**Answer:**

It tells the browser to include credentials such as cookies with the request, particularly when making cross-origin requests.

---

### 14. Why is `credentials: true` required in CORS?

```js
cors({
  origin: "http://localhost:5173",
  credentials: true
})
```

**Answer:**

It allows the server to accept credentialed cross-origin requests, including cookies.

---

### 15. Why do we need both?

Frontend:

```js
credentials: "include"
```

Backend:

```js
credentials: true
```

**Answer:**

The frontend requests that credentials/cookies be included, while the backend CORS configuration allows credentialed cross-origin requests.

Both sides need to be configured appropriately.

---

### 16. What does `bcrypt.compare()` do?

```js
bcrypt.compare(password, user.password)
```

**Answer:**

It compares the plain password entered during login against the stored bcrypt hash without needing to decrypt the hash.

---

### 17. Can bcrypt decrypt a password?

**Answer:**

No. bcrypt is a one-way password hashing mechanism. During login, `bcrypt.compare()` checks whether the supplied password corresponds to the stored hash.

---

### 18. Why don't we store the JWT in the database?

**Answer:**

In a typical JWT-based authentication design, the server can verify the token cryptographically using the signing secret without needing to store every token in the database.

---

### 19. What does `jwt.sign()` do?

```js
jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET
);
```

**Answer:**

It creates a signed JWT containing the specified payload.

---

### 20. What does `jwt.verify()` do?

```js
jwt.verify(token, process.env.JWT_SECRET);
```

**Answer:**

It verifies that the token is valid and was signed with the expected secret. If valid, it returns the decoded payload.

---

# 🟠 MEDIUM

### 21. Explain the login flow.

**Expected answer:**

> The frontend sends the email and password to the login API. The backend finds the user by email, compares the supplied password with the stored bcrypt hash, and if they match, generates a JWT. The JWT is sent as an HTTP cookie. The frontend then navigates to the protected home page.

---

### 22. How does the server know which user is logged in?

**Answer:**

The JWT contains information such as the user's ID:

```js
{
  userId: user._id
}
```

The authentication middleware verifies the token and extracts that ID.

```js
req.userId = decoded.userId;
```

---

### 23. What happens if there is no token?

**Answer:**

The authentication middleware rejects the request.

For example:

```js
if (!token) {
  return res.status(401).json({
    message: "Unauthorized"
  });
}
```

---

### 24. What happens if the JWT is invalid?

**Answer:**

`jwt.verify()` throws an error, which should be caught and the server should return an authentication error such as `401 Unauthorized`.

---

### 25. Why is `/me` protected?

**Answer:**

Because it returns information belonging to the authenticated user. The authentication middleware ensures that only an authenticated user can access it.

---

### 26. What is middleware?

**Answer:**

Middleware is a function that runs during the Express request-response cycle.

Example:

```js
router.get(
  "/me",
  authMiddleware,
  getMe
);
```

The request must pass `authMiddleware` before reaching `getMe`.

---

### 27. What does `next()` do?

```js
next();
```

**Answer:**

It passes control from the current middleware to the next middleware or route handler.

---

### 28. Why do we use `select("-password")`?

```js
User.findById(req.userId)
  .select("-password");
```

**Answer:**

It excludes the password field from the returned user document so that the hashed password isn't unnecessarily sent to the client.

---

### 29. Why return 401 for invalid credentials?

**Answer:**

`401 Unauthorized` indicates that authentication failed or valid authentication credentials were not provided.

---

### 30. What happens after logout?

**Answer:**

The server clears the authentication cookie:

```js
res.clearCookie("token");
```

Then the frontend redirects the user to:

```text
/login
```

---

# 🔴 Strong Medium Questions

These are particularly useful for distinguishing students who understand the implementation.

### 31. Why do we hash the password during registration but use `compare()` during login?

**Answer:**

During registration, the plain password needs to be transformed into a secure stored hash:

```js
bcrypt.hash(password, 10)
```

During login, we already have the stored hash, so we use:

```js
bcrypt.compare(password, hash)
```

to determine whether the entered password matches it.

---

### 32. Why can't we do this?

```js
if (password === user.password)
```

**Answer:**

Because `user.password` should contain a bcrypt hash, not the original password. The plain password and its hash will not be equal. `bcrypt.compare()` is designed for this comparison.

---

### 33. What is inside the JWT?

For example:

```js
jwt.sign(
  {
    userId: user._id
  },
  secret
);
```

**Answer:**

The payload contains the `userId`. JWTs also contain standard claims/metadata depending on how they are generated. The token is signed so the server can verify its integrity.

---

### 34. Is JWT encrypted?

**Answer:**

Normally, no. A JWT is generally **encoded and signed**, not encrypted. Therefore, sensitive information should not be placed in the payload merely because it is inside a JWT.

---

### 35. What happens if someone modifies the JWT?

**Answer:**

The signature will no longer match the token's contents, so `jwt.verify()` should reject it.

---

### 36. Why should `JWT_SECRET` be stored in `.env`?

**Answer:**

The secret should not be hardcoded in source code or exposed publicly. Environment variables provide a separate configuration mechanism for sensitive secrets.

Example:

```env
JWT_SECRET=my-super-secret-key
```

Then:

```js
process.env.JWT_SECRET
```

---

### 37. What happens if the email already exists?

**Answer:**

The backend should detect the existing user:

```js
const existingUser =
  await User.findOne({ email });
```

and return an error rather than creating another account with the same email.

---

### 38. Why is email marked `unique: true`?

```js
email: {
  type: String,
  unique: true
}
```

**Answer:**

It creates a uniqueness constraint/index so multiple users should not have the same email. However, the application should still handle duplicate-key errors rather than relying solely on frontend validation.

---

### 39. What is the difference between authentication and protected routing?

**Answer:**

Authentication verifies who the user is.

Protected routing controls whether the user can access a particular resource/page based on authentication status.

For example:

```text
Login → authentication

/me → protected API
/home → protected UI
```

---

### 40. Explain the complete protected-page flow.

A strong student should answer something like:

> When the user opens `/home`, React requests `/api/auth/me` with credentials included. The browser sends the authentication cookie. Express reads the token using `req.cookies.token`. The authentication middleware verifies the JWT and extracts the user ID. The server then retrieves that user's information from MongoDB and returns it. React stores the user information and displays the name, email, and phone number.

---

# ⭐ Quick Viva Questions You Can Fire at Students

These are excellent for a practical exam because they can be asked directly while looking at the student's code.

### Q1.

**Why did you write this?**

```js
credentials: "include"
```

Expected:

> To include cookies/credentials in the request.

---

### Q2.

**What happens if I remove this?**

```js
bcrypt.hash(password, 10)
```

Expected:

> The password could be stored in plain text, which is insecure.

---

### Q3.

**What does this do?**

```js
const token = req.cookies.token;
```

Expected:

> It retrieves the JWT authentication token from the browser cookie.

---

### Q4.

**What does this do?**

```js
req.userId = decoded.userId;
```

Expected:

> It stores the authenticated user's ID from the verified JWT on the request object so later middleware/route handlers can use it.

---

### Q5.

**Why do we call `next()`?**

Expected:

> To continue the request to the next middleware or route handler.

---

### Q6.

**What happens if I manually open `/home` without logging in?**

Expected:

> The protected API should reject the request because there is no valid authentication cookie, and the frontend should redirect to `/login`.

---

### Q7.

**Why is `password` not displayed on the home page?**

Expected:

> Password information should not be returned to the frontend. We can explicitly exclude it with `.select("-password")`.

---

### Q8.

**Why do we use 401 instead of 404 for invalid login?**

Expected:

> Because the problem is authentication failure, not that the requested resource doesn't exist.

---

### Q9.

**What is the difference between `jwt.sign()` and `jwt.verify()`?**

Expected:

```text
jwt.sign()
→ creates a signed token

jwt.verify()
→ validates the token and extracts its payload
```

---

### Q10.

**Explain registration → login → home → logout without looking at your code.**

A student who genuinely understands the project should be able to explain:

```text
REGISTER
   ↓
POST /register
   ↓
Validate
   ↓
Hash password
   ↓
Save MongoDB
   ↓
Redirect /login

LOGIN
   ↓
POST /login
   ↓
Find user
   ↓
bcrypt.compare()
   ↓
JWT
   ↓
Cookie
   ↓
/home

HOME
   ↓
GET /me
   ↓
Cookie
   ↓
JWT verify
   ↓
User data
   ↓
Display user

LOGOUT
   ↓
POST /logout
   ↓
Clear cookie
   ↓
/login
```

That final question is probably the **single most useful viva question** for this assignment because it tests whether the student understands the entire authentication architecture rather than individual syntax.
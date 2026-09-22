# 🎯 High-Difficulty TA Viva Questions for Lab 02
### Topic: Full-Stack Authentication (React + Express + JWT + HttpOnly Cookies)

These questions go beyond surface-level syntax to test **system architecture, security vulnerabilities, network protocols, and React runtime internals**.

---

## 1. Controlled Components & React State (Registration & Login)

### ❓ Question 1: "Why do we use Controlled Components for form fields, and what performance tradeoff occurs on every keystroke?"
* **Why this is tough:** Most students repeat "because React manages the state." They rarely understand the Virtual DOM re-render cycle or the alternative (Uncontrolled Components via `useRef`).
* **Expected Student Answer:**
  > *"A controlled component binds the input's value directly to React state (`value={state}`) and updates it via `onChange`. This gives us single-source-of-truth, allowing instant client-side validation, disabling submit buttons conditionally, and formatting input on the fly.*  
  > *However, the tradeoff is that **every single keystroke triggers a component re-render**. In large forms or slow devices, re-rendering the whole component on every key press can cause UI lag. The alternative is Uncontrolled Components using `useRef()`, which reads the value from the DOM directly only on form submission without intermediate re-renders."*
* **TA Counter-Question:** *"If a user rapidly types 50 characters, does React batch those `setState` updates or run 50 re-renders?"*
  * **Answer:** *"In React 18, automatic batching groups state updates inside async handlers, but keystroke events usually fire discrete renders unless debounced."*

---

### ❓ Question 2: "If we already perform strict validation on the frontend (regex for email, min length for password), why is it considered a critical bug if the backend does not duplicate the exact same validation?"
* **Why this is tough:** Tests understanding of the browser as an untrusted client.
* **Expected Student Answer:**
  > *"Frontend validation is solely for **User Experience (UX)** to give instant visual feedback without a network round-trip. It is **zero-percent security** because any user or attacker can bypass React completely using Postman, cURL, or browser dev tools (`fetch` in the console) to send invalid, malicious, or SQL/NoSQL injection payloads directly to `/customers/register`. The backend must always be the ultimate authority of validation."*

---

## 2. HttpOnly Cookies, CORS & Networking (Login & Auth)

### ❓ Question 3: "Explain exactly why `withCredentials: true` is needed on the frontend, and what specific backend CORS header MUST be configured for it to work?"
* **Why this is tough:** Students usually just copy-paste CORS config without understanding browser cross-origin credential policies.
* **Expected Student Answer:**
  > *"By default, the browser's Same-Origin Policy blocks sending or receiving cookies across different origins (e.g. frontend on `localhost:5173` and backend on `localhost:5001`).*  
  > *1. On the frontend, Axios's `withCredentials: true` instructs the browser to include cookies in outgoing cross-origin requests and to accept `Set-Cookie` response headers.*  
  > *2. On the backend, Express CORS must set `credentials: true` (which sends the HTTP response header `Access-Control-Allow-Credentials: true`).*  
  > *3. Crucially: When `credentials: true` is enabled, `Access-Control-Allow-Origin` **CANNOT be wildcard (`*`)**. It MUST be the exact origin (`http://localhost:5173`), or the browser will block the response for security reasons."*

---

### ❓ Question 4: "Why do we store the JWT in an `HttpOnly` cookie instead of `localStorage` or `sessionStorage`?"
* **Why this is tough:** Tests knowledge of real-world web exploits (XSS vs CSRF).
* **Expected Student Answer:**
  > *"If a JWT is stored in `localStorage`, it is accessible to ANY JavaScript executing on the page via `window.localStorage.getItem('token')`. If the application has an **XSS (Cross-Site Scripting)** vulnerability (e.g. a malicious npm package or an injected script), an attacker can steal the JWT and hijack the session.*  
  > *An `HttpOnly` cookie **cannot be read by JavaScript** (`document.cookie` returns nothing for it). Even if malicious JS runs on the client, the token cannot be extracted or exfiltrated directly.*  
  > *While cookies can be vulnerable to CSRF (Cross-Site Request Forgery), this is mitigated using `SameSite=Strict` or `SameSite=Lax` cookie flags."*

---

## 3. Login Security & User Enumeration

### ❓ Question 5: "On login failure, why do we return a generic message 'Invalid email or password' instead of saying 'Email does not exist' or 'Incorrect password'?"
* **Why this is tough:** Tests application security best practices.
* **Expected Student Answer:**
  > *"Revealing whether the email exists leads to a **User Enumeration Vulnerability**. An attacker can write an automated script to spray thousands of email addresses against `/customers/login`. If the server replies 'Email not found', the attacker knows who does NOT have an account; if it replies 'Incorrect password', the attacker has successfully discovered a valid account email and can focus brute-force or credential-stuffing attacks on that user."*

---

## 4. Protected Routes & Flash of Unauthenticated Content (Home Page)

### ❓ Question 6: "In React, when a user refreshes the `/home` page, what is the 'Flash of Unauthenticated Content (FOUC)' problem, and how did you prevent it?"
* **Why this is tough:** Almost every student encounters this bug where the login screen flashes for half a second before redirecting back to home.
* **Expected Student Answer:**
  > *"When the user hits refresh on `/home`, React initializes with default state (`customer = null`). If our router immediately checks `if (!customer) return <Navigate to='/login' />`, it will instantly redirect the user to login **before** the asynchronous `GET /customers/me` API request has even finished checking the cookie.*  
  > *To fix this, we introduce an initial loading state (e.g., `checkingAuth = true`). While `checkingAuth` is true, we display a loading spinner or blank screen. We only redirect to `/login` **after** the API call has completed and returned a 401 error."*

---

## 5. Token Invalidation & Statelessness (Logout)

### ❓ Question 7: "When a user logs out, the frontend calls `res.clearCookie('token')`. If an attacker had already stolen that JWT 5 minutes earlier, does logging out stop the attacker from making API requests?"
* **Why this is tough:** Exposes the fundamental architectural reality of **Stateless JWTs**.
* **Expected Student Answer:**
  > *"**No! It does NOT stop the attacker.**  
  > JWTs are stateless. The server does not store active tokens in a database; it only cryptographically verifies the signature (`jwt.verify(token, secret)`).  
  > When we call `res.clearCookie()`, we only instruct the user's browser to delete the cookie locally. The token itself is still cryptographically valid until its expiration time (`exp`). If an attacker possesses that token string, they can continue making requests directly to protected endpoints until the token expires.*  
  > *In production systems, true immediate revocation requires maintaining a **Token Blacklist** (e.g. in Redis) or storing a `tokenVersion` / `passwordChangedAt` timestamp in MongoDB to invalidate older tokens."*

---

### ❓ Question 8: "What happens if a user's JWT expires while they are actively filling out a form on the Home page, and they click Submit?"
* **Why this is tough:** Tests error lifecycle handling.
* **Expected Student Answer:**
  > *"1. The browser sends the expired cookie to the backend.*  
  > *2. `jwt.verify()` throws a `TokenExpiredError` in the auth middleware.*  
  > *3. The middleware catches this and responds with `401 Unauthorized`.*  
  > *4. On the frontend, our Axios response interceptor or catch block catches the 401, clears the local customer state, and redirects the user to `/login` with an alert asking them to re-authenticate."*

---

## 📋 TA 30-Mark Viva Scoring Matrix

| Tier | Characteristics of the Answer | Marks Awarded |
|---|---|:---:|
| **Top Tier (26–30)** | Explains the underlying *why* (XSS, browser cookie sandboxing, statelessness, Virtual DOM re-renders, CORS preflight mechanics). Answers follow-up cross-questions effortlessly. | **26 – 30** |
| **Solid Tier (18–25)** | Understands the code they wrote and what each function does, but struggles slightly with low-level protocol details (e.g. why `*` cannot be used with credentials). | **18 – 25** |
| **Surface Tier (10–17)** | Knows syntax and React hooks (`useState`, `useEffect`), but cannot explain security differences between `localStorage` and `HttpOnly` cookies. | **10 – 17** |
| **Failing Tier (<10)** | Blindly copied starter code; unable to explain what `req.user` does or why `withCredentials` is necessary. | **0 – 9** |
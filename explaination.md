# Project Data Flow Explanation

This document explains in detail how data flows between the Frontend, Context APIs, Backend Routes, Controllers, and MongoDB for the core features: **Signup**, **Login**, **Add Task**, and **Add Subtask**.

---

## 1. Signup Flow

**Overview:** An unregistered user creates an account from the frontend and their data is safely persisted in the database.

1. **Frontend UI (`Signup.jsx`)**
   - User inputs their `name`, `email`, and `password` and submits the form.
   - The `handleSubmit` function triggers and calls `signup({ name, email, password })` from the global authentication context.

2. **Frontend Context (`AuthContext.jsx`)**
   - The `signup` function makes an HTTP `POST` request using `fetch` to `http://localhost:5000/api/auth/signup`.
   - The body contains the stringified JSON data (`name`, `email`, `password`).

3. **Backend Routes (`authRoutes.js`)**
   - The Express router intercepts the `/api/auth/signup` URL and directs the request to the `signup` controller function.

4. **Backend Controller (`authController.js` > `signup`)**
   - Extracts `name`, `email`, and `password` from `req.body`.
   - Validates that fields exist and the password is at least 6 characters.
   - **Database Check:** Calls `User.findOne({ email })` to ensure the email isn't already registered.
   - **Security:** Hashes the password securely using `bcrypt` (10 salt rounds).
   - **Database Action:** Creates the new user in MongoDB via `User.create({ name, email, passwordHash })`.
   - **Token Generation:** Generates a JSON Web Token (JWT) linked to the user's ID via `generateToken(user._id)`.
   - Returns a `201 Created` generic HTTP status containing the `token` and the `user` payload (id, name, email).

5. **Back to Frontend (`AuthContext.jsx` -> `Signup.jsx`)**
   - Receives the JSON response.
   - Saves `token` to `localStorage` under the key `'pm_token'`.
   - Saves `user` to `localStorage` under the key `'pm_current_user'`.
   - Updates the global React `user` state context.
   - Finally, `Signup.jsx` displays a success toast and redirects the user to `/dashboard` using React Router's `navigate()`.


## 3. Add Task Flow

**Overview:** Creating a new parent task for the user's dashboard.

1. **Frontend Call (`TasksContext.jsx`)**
   - A dashboard component receives user input (Title, Description, Status, Priority, Date, Project) and triggers `addTask(taskRequestData)`.
   - Reaches into `localStorage` taking the `pm_token` to make the `Authorization: Bearer <token>` header.
   - Shoots a `POST` request to `http://localhost:5000/api/tasks`.

2. **Backend Authentication Middleware (`authMiddleware.js`)**
   - Intercepts the request to ensure the user is logged in.
   - Confirms the token is valid, decodes the `userId`, and places it on `req.user`.

3. **Backend Routes (`taskRoutes.js`)**
   - Directs the `POST /api/tasks/` to the `createTask` function.

4. **Backend Controller (`taskController.js` > `createTask`)**
   - Extracts all fields from `req.body`.
   - Validates that a `title` provides mandatory data text.
   - **Database Action:** Saves logic to MongoDB via `Task.create(...)`. 
     - Associates the global `req.user.id` so the system knows whose task it is.
     - Automatically attaches a `createdAt` timestamp.
     - Adds `subtasks: []` by default to the document.
   - Returns a `201 Created` status with the fully populated Task object.

5. **Back to Frontend (`TasksContext.jsx`)**
   - **Normalization:** Formats `_id` to `id` for frontend standard usage.
   - Updates the React Task state array: `setTasksState((prev) => [normalizeTask(data), ...prev])`.
   - The UI automatically re-nders to insert the new task immediately.

---

## 4. Add Subtask Flow

**Overview:** Appending small inner steps inside an already created parent Task.

1. **Frontend Call (`TasksContext.jsx`)**
   - When inside a specific task panel, the user types a subtask title.
   - A UI component calls `addSubtask(taskId, title)`.
   - Initiates an HTTP `POST` request to `http://localhost:5000/api/tasks/${taskId}/subtasks` with valid Headers.

2. **Backend Authentication Middleware (`authMiddleware.js`)**
   - Verifies user authorization and injects corresponding `userId` to `req.user`.

3. **Backend Routes (`taskRoutes.js`)**
   - Accepts the subtask `POST` endpoint carrying dynamic router parameter `/:id/subtasks` mapping `id` dynamically pointing to `addSubtask`.

4. **Backend Controller (`taskController.js` > `addSubtask`)**
   - Grabs `req.body.title`.
   - **Database Query:** Finds the parent task `Task.findOne({ _id: req.params.id, userId: req.user.id })`.
   - Takes the retrieved task object framework and targets its native `subtasks` array.
   - Injects the subtask directly: `task.subtasks.push({ title, completed: false })`.
   - Saves parent layout array to MongoDB through `await task.save()`.
   - Returns the freshly updated parent task.

5. **Back to Frontend (`TasksContext.jsx`)**
   - Extracts the newly updated parent task JSON.
   - Replaces the respective parent container spanning updating local memory: `setTasksState((prev) => prev.map((t) => (t.id === taskId ? normalizeTask(data) : t)))`.
   - The dashboard dynamically displays the new subtask component instantly tracking live modification updates.



---

## JWT Details 🔐

**What is a JWT?**
A JSON Web Token (JWT) is a compact, URL-safe token used to securely transmit information between parties. In this project the token encodes the `userId` and is signed with a secret so the server can verify its authenticity.

**Creation:**
- The helper `generateToken(userId)` in `authController.js` calls
  ```js
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  ```
- The payload `{ id: userId }` is stored inside the token.
- The `JWT_SECRET` (set in environment variables) protects the token from tampering.
- Tokens are configured to expire after 7 days, after which the client must re‑authenticate.

**Storage & Usage:**
- Upon successful signup or login the backend returns the token to the frontend.
- The frontend saves it in `localStorage` under the key `pm_token`.
- All subsequent API requests requiring authentication include it in the `Authorization: Bearer <token>` header.

**Validation:**
- The `authMiddleware.js` reads the `Authorization` header, extracts the token, and calls
  ```js
  jwt.verify(token, process.env.JWT_SECRET);
  ```
- If verification succeeds, the decoded payload (including `id`) is attached to `req.user`.
- If the token is missing, invalid, or expired, the middleware responds with a `401 Unauthorized` error.

With this mechanism the server trusts only requests accompanied by a valid JWT, ensuring that protected routes are accessible only to authenticated users.

## 2. Login Flow

**Overview:** An existing user authenticates into the app to get their session access token.

1. **Frontend UI (`Login.jsx`)**
   - User inputs their `email` and `password` and presses sign in.
   - The `handleSubmit` function correctly triggers `login(email, password)` from the authentication context.

2. **Frontend Context (`AuthContext.jsx`)**
   - Makes an HTTP `POST` request using `fetch` to `http://localhost:5000/api/auth/login`.

3. **Backend Routes (`authRoutes.js`)**
   - Forwards `/api/auth/login` pointing directly to the `login` function.

4. **Backend Controller (`authController.js` > `login`)**
   - Extracts the credentials from `req.body`.
   - **Database Check:** Uses `User.findOne({ email })` to find the registered user.
   - **Security:** Verifies the password using `bcrypt.compare(password, user.passwordHash)`.
   - **Token Generation:** Creates a new JWT representing a secure session.
   - Returns a `200 OK` generic HTTP status encapsulating the `token` and `user` data.

5. **Back to Frontend (`AuthContext.jsx` -> `Login.jsx`)**
   - Saves the JWT to `localStorage` (`pm_token`).
   - Updates `pm_current_user` in `localStorage`.
   - Sets the global React state for the `user`.
   - `Login.jsx` subsequently displays the success message and redirects to `/dashboard`.

---

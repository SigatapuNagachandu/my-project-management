# My Project Management App — Complete Explanation
# Saved: 2026-02-25
# Read this whenever you want to revise your project!

================================================================================
TECH STACK (MERN)
================================================================================

M = MongoDB       → stores all users and tasks in the cloud (Atlas)
E = Express       → backend web framework (runs on Node.js)
R = React         → frontend UI (what the user sees in the browser)
N = Node.js       → backend runtime (like the engine running Express)

Frontend runs on: http://localhost:5173  (Vite dev server)
Backend runs on:  http://localhost:5000  (Express server)

================================================================================
PROJECT FOLDER STRUCTURE
================================================================================

my-project-management/
│
├── backend/                        ← The SERVER side (Node.js + Express)
│   ├── server.js                   ← Entry point. Starts the server, connects to MongoDB
│   ├── .env                        ← Secret config: MONGO_URI, JWT_SECRET, PORT
│   ├── authMiddleware.js           ← Checks JWT token on every protected request
│   ├── models/
│   │   ├── User.js                 ← Blueprint for a User in MongoDB
│   │   └── Task.js                 ← Blueprint for a Task (with subtasks inside)
│   ├── controllers/
│   │   ├── authController.js       ← Logic for signup and login
│   │   └── taskController.js       ← Logic for creating/reading/updating/deleting tasks
│   └── routes/
│       ├── authRoutes.js           ← URL paths for /api/auth/signup and /api/auth/login
│       └── taskRoutes.js           ← URL paths for /api/tasks (all task operations)
│
└── client-side/react-project/
    └── src/
        ├── App.jsx                 ← Sets up router and providers
        ├── context/
        │   ├── AuthContext.jsx     ← Manages who is logged in (global auth state)
        │   └── TasksContext.jsx    ← Manages all task data (fetches from MongoDB API)
        └── components/pages/
            ├── Home.jsx            ← Landing page
            ├── Login.jsx           ← Login form
            ├── Signup.jsx          ← Signup form
            └── dashboard/          ← All dashboard views (Tasks, Projects, Calendar, etc.)


================================================================================
HOW DATA FLOWS — STEP BY STEP
================================================================================

--------------------------------------------------------------------------------
1. APP STARTUP
--------------------------------------------------------------------------------
- Browser opens http://localhost:5173
- React renders App.jsx
- App.jsx wraps everything in <AuthProvider>
- AuthProvider immediately checks localStorage for saved login info (key: "pm_current_user")
- If found → user is restored as "logged in" without needing to log in again
- If not found → user is treated as a guest

Provider tree (from App.jsx):
  <AuthProvider>         ← knows WHO is logged in
    <Router>
      <ProtectedRoute>   ← blocks non-logged-in users from /dashboard
        <TasksProvider>  ← knows WHAT tasks exist (fetches from MongoDB)
          <Dashboard />

--------------------------------------------------------------------------------
2. SIGNUP FLOW
--------------------------------------------------------------------------------

User fills name/email/password → clicks "Create account"
  ↓
Signup.jsx calls: signup({ name, email, password })   [from AuthContext]
  ↓
AuthContext sends:
  POST http://localhost:5000/api/auth/signup
  Body: { name, email, password }
  ↓
authController.js (signup function):
  1. Checks all fields are present
  2. Checks password is at least 6 characters
  3. Checks if email already exists in MongoDB
  4. Hashes the password using bcrypt (so the real password is NEVER stored)
  5. Creates a new User document in MongoDB
  6. Creates a JWT token (valid for 7 days)
  7. Sends back: { token, user: { id, name, email } }
  ↓
AuthContext:
  - Saves token to localStorage (key: "pm_token")
  - Saves user info to localStorage (key: "pm_current_user")
  - Sets user state → app knows you're logged in
  ↓
Signup.jsx → navigate('/dashboard')   ← redirect to dashboard

--------------------------------------------------------------------------------
3. LOGIN FLOW
--------------------------------------------------------------------------------

User fills email/password → clicks "Sign in"
  ↓
Login.jsx calls: login(email, password)   [from AuthContext]
  ↓
AuthContext sends:
  POST http://localhost:5000/api/auth/login
  Body: { email, password }
  ↓
authController.js (login function):
  1. Finds user by email in MongoDB
  2. Compares password with stored hash using bcrypt
  3. If match → creates JWT token
  4. Sends back: { token, user: { id, name, email } }
  ↓
(Same as signup from here — saves token, sets user state, redirects to dashboard)

--------------------------------------------------------------------------------
4. PROTECTED ROUTE — GUARDING THE DASHBOARD
--------------------------------------------------------------------------------

When you try to visit /dashboard:
- ProtectedRoute checks: is there a user in AuthContext?
- YES → allows you through to the dashboard
- NO  → redirects you to /login

This means: if someone tries to go to /dashboard without being logged in,
            they are automatically sent back to /login.

--------------------------------------------------------------------------------
5. LOADING TASKS (when dashboard opens)
--------------------------------------------------------------------------------

TasksProvider mounts → useEffect triggers:
  ↓
  fetch GET http://localhost:5000/api/tasks
  Headers: { Authorization: "Bearer <your_token>" }
  ↓
authMiddleware.js runs FIRST:
  - Reads the token from the Authorization header
  - Verifies it using JWT_SECRET (from .env file)
  - Extracts userId from the token
  - Attaches req.user = { id: userId }
  - Passes request to controller
  ↓
taskController.js (getTasks):
  - Queries MongoDB: find all tasks WHERE userId = logged-in user's id
  - Returns array of tasks (sorted newest first)
  ↓
TasksContext:
  - Receives task array
  - Normalizes them: converts MongoDB "_id" → "id" (for React to use)
  - Sets tasks state → all dashboard pages can now display tasks

--------------------------------------------------------------------------------
6. CREATING A TASK
--------------------------------------------------------------------------------

User types task title → clicks Add
  ↓
Component calls: addTask({ title, priority, project, status })
  ↓
TasksContext sends:
  POST http://localhost:5000/api/tasks
  Body: { title, priority, project, status }
  Headers: { Authorization: "Bearer <token>" }
  ↓
taskController.js (createTask):
  - Creates Task document in MongoDB with userId = logged-in user
  - subtasks: [] (empty array by default)
  - Returns the created task
  ↓
TasksContext:
  - Adds the new task to the front of tasks state
  - React re-renders → task appears in the UI instantly

--------------------------------------------------------------------------------
7. ADDING A SUBTASK
--------------------------------------------------------------------------------

User types subtask title → clicks Add Subtask
  ↓
Component calls: addSubtask(taskId, title)
  ↓
TasksContext sends:
  POST http://localhost:5000/api/tasks/:taskId/subtasks
  Body: { title }
  ↓
taskController.js (addSubtask):
  - Finds the parent task (checks userId for security!)
  - Pushes { title, completed: false } to the subtasks array inside the task
  - Saves updated task to MongoDB
  - Returns the full updated task
  ↓
TasksContext:
  - Replaces the old task with the updated one in state
  - React re-renders → subtask appears under the task

--------------------------------------------------------------------------------
8. TOGGLING A SUBTASK (checkbox)
--------------------------------------------------------------------------------

User clicks subtask checkbox
  ↓
Component calls: toggleSubtaskStatus(taskId, subtaskId)
  ↓
TasksContext sends:
  PATCH http://localhost:5000/api/tasks/:taskId/subtasks/:subtaskId
  ↓
taskController.js (toggleSubtask):
  - Finds the task
  - Finds the specific subtask using its _id
  - Flips: completed = !completed
  - Saves and returns updated task
  ↓
TasksContext → state updates → checkbox ticks/unticks in UI

--------------------------------------------------------------------------------
9. UPDATING A TASK (status, priority, title, etc.)
--------------------------------------------------------------------------------

Component calls: updateTask(id, { status: 'done' })
  ↓
TasksContext sends:
  PUT http://localhost:5000/api/tasks/:id
  Body: { status: 'done' }
  ↓
taskController.js (updateTask):
  - Finds task by _id AND userId (security: you can only edit YOUR tasks)
  - Updates allowed fields: title, description, status, priority, project, dueDate
  - If status becomes 'done' → sets completedAt to current timestamp
  - If status changes away from 'done' → clears completedAt
  - Saves and returns task
  ↓
TasksContext → state updates → UI re-renders with new values

--------------------------------------------------------------------------------
10. DELETING A TASK
--------------------------------------------------------------------------------

User clicks delete button
  ↓
Component calls: deleteTask(id)
  ↓
TasksContext sends:
  DELETE http://localhost:5000/api/tasks/:id
  ↓
taskController.js (deleteTask):
  - Task.findOneAndDelete({ _id, userId })
  - Only deletes if it belongs to you!
  ↓
TasksContext:
  - Removes task from state array
  - Task disappears from UI

--------------------------------------------------------------------------------
11. LOGOUT
--------------------------------------------------------------------------------

User clicks Logout
  ↓
Component calls: logout() from AuthContext
  ↓
AuthContext:
  - Removes "pm_token" from localStorage
  - Removes "pm_current_user" from localStorage
  - Sets user = null
  ↓
App.jsx detects user = null
- ProtectedRoute redirects to Home/Login page
- TasksProvider unmounts → tasks state cleared from memory


================================================================================
HOW JWT (TOKEN) SECURITY WORKS
================================================================================

JWT = JSON Web Token. It's like a digital stamp/badge.

1. When you LOG IN → server creates a token by signing your userId with a secret key
   Token looks like: eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY1YSJ9.Xy_abc123...

2. Client STORES the token in localStorage

3. Every API request → client sends token in header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

4. Server's authMiddleware VERIFIES the token:
   - Checks it hasn't been tampered with (uses JWT_SECRET)
   - Checks it hasn't expired (7 days)
   - Extracts userId from inside the token
   - Adds req.user.id so controllers know WHO is making the request

5. Controllers use req.user.id to only return/change THAT user's data

If token is missing or fake → 401 Unauthorized (blocked)


================================================================================
WHAT IS STORED WHERE
================================================================================

In MONGODB (permanent, survives restart):
  - Users: name, email, hashed password, createdAt
  - Tasks: title, description, status, priority, project, dueDate,
           completedAt, userId (owner), subtasks[] (embedded array)

In LOCALSTORAGE (browser only, user-specific):
  - "pm_token"        → JWT auth token
  - "pm_current_user" → { id, name, email } of logged-in user
  - "pm_events"       → Calendar events
  - "pm_notifications"→ Notification list
  - "pm_today_focus"  → Today's focus items


================================================================================
MONGODB DOCUMENT EXAMPLES
================================================================================

User document stored in MongoDB:
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "passwordHash": "$2b$10$hashedValueHere...",  ← bcrypt hash, NEVER the real password
  "createdAt": "2026-02-25T07:00:00Z",
  "updatedAt": "2026-02-25T07:00:00Z"
}

Task document stored in MongoDB:
{
  "_id": "65f9a1b2c3d4e5f6a7b8c9d0",
  "title": "Build login page",
  "description": "Design and implement the login UI",
  "status": "in-progress",          ← "todo" | "in-progress" | "done"
  "priority": "high",               ← "low" | "medium" | "high"
  "project": "Website",
  "dueDate": null,
  "completedAt": null,
  "userId": "65a1b2c3d4e5f6a7b8c9d0e1",  ← links to the User who owns it
  "subtasks": [
    { "_id": "...", "title": "Design UI mockup", "completed": true },
    { "_id": "...", "title": "Add form validation", "completed": false }
  ],
  "createdAt": "2026-02-25T07:30:00Z",
  "updatedAt": "2026-02-25T08:00:00Z"
}


================================================================================
API ENDPOINTS REFERENCE
================================================================================

AUTH (no token needed):
  POST /api/auth/signup     → register new user
  POST /api/auth/login      → login existing user

TASKS (token REQUIRED in every request):
  GET    /api/tasks                         → get all my tasks
  POST   /api/tasks                         → create a new task
  PUT    /api/tasks/:id                     → update a task
  DELETE /api/tasks/:id                     → delete a task
  POST   /api/tasks/:id/subtasks            → add a subtask
  PATCH  /api/tasks/:id/subtasks/:sid       → toggle subtask done/undone
  DELETE /api/tasks/:id/subtasks/:sid       → delete a subtask


================================================================================
BIG PICTURE SUMMARY
================================================================================

BROWSER (React)
  └─ AuthContext   →  tracks WHO is logged in (reads from localStorage)
  └─ TasksContext  →  tracks WHAT tasks exist (fetches from MongoDB via API)
         ↕  HTTP Requests with JWT token in every header
EXPRESS SERVER (Node.js, port 5000)
  └─ authMiddleware   →  verifies every token
  └─ authController   →  handles signup/login
  └─ taskController   →  handles all task CRUD
         ↕  Mongoose queries
MONGODB ATLAS
  └─ Users collection  →  stores user accounts
  └─ Tasks collection  →  stores all tasks + subtasks

Every click in the UI becomes an HTTP request to Express,
which talks to MongoDB, which sends data back to React,
which updates the state and re-renders the UI.

================================================================================
HOW TO RUN THE PROJECT
================================================================================

Terminal 1 - Start Backend:
  cd c:\mern\my-project-management\backend
  npm run dev
  → Should print: "MongoDB connected" and "Server running on port 5000"

Terminal 2 - Start Frontend:
  cd c:\mern\my-project-management\client-side\react-project
  npm run dev
  → Open http://localhost:5173 in your browser

================================================================================


================================================================================
JWT — COMPLETE DEEP DIVE (FOR VIVA)
================================================================================

JWT = JSON Web Token
It is a compact, URL-safe token used to securely transfer information between
two parties (your browser and your backend server).

Standard: RFC 7519
Used for: Authentication (Who are you?) and Authorization (What can you access?)

--------------------------------------------------------------------------------
STRUCTURE OF A JWT
--------------------------------------------------------------------------------

A JWT looks like this (3 parts separated by dots):

  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← PART 1: Header
  .
  eyJpZCI6IjY1YTFiMmMzZDRlNWY2YSIsImlhdCI6MTcwODg0MDAwMCwiZXhwIjoxNzA5NDQ0ODAwfQ
                                           ← PART 2: Payload
  .
  Xy_abc123signatureHere                   ← PART 3: Signature

Each part is Base64URL encoded (NOT encrypted — it can be decoded!).
Only the SIGNATURE is secret — it proves the token was created by your server.

--- PART 1: HEADER ---
Decoded header:
{
  "alg": "HS256",      ← Algorithm used to sign (HMAC SHA-256)
  "typ": "JWT"         ← Type of token
}

--- PART 2: PAYLOAD (the data inside) ---
Decoded payload (what we put in it):
{
  "id": "65a1b2c3d4e5f6a7b8c9d0e1",   ← userId (from MongoDB)
  "iat": 1708840000,                   ← Issued At (Unix timestamp)
  "exp": 1709444800                    ← Expires At (7 days later)
}

In your code (authController.js):
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
         ↑ payload       ↑ secret key               ↑ expiry

--- PART 3: SIGNATURE ---
Created by:
  HMACSHA256(
    base64(header) + "." + base64(payload),
    JWT_SECRET
  )

The signature CANNOT be faked without knowing JWT_SECRET.
If anyone tampers with the payload (e.g., changes userId), the signature
breaks and the server rejects the token.

--------------------------------------------------------------------------------
HOW JWT WORKS IN YOUR PROJECT (FULL LIFECYCLE)
--------------------------------------------------------------------------------

STEP 1 — TOKEN CREATION (at login/signup):
  Server runs: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
  This creates a token and sends it back to the client.

STEP 2 — TOKEN STORAGE (frontend):
  AuthContext stores it: localStorage.setItem('pm_token', data.token)
  It stays there even if you refresh the page or close the tab.

STEP 3 — TOKEN SENT WITH EVERY REQUEST:
  TasksContext reads it: localStorage.getItem('pm_token')
  Then adds it to every API call header:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STEP 4 — TOKEN VERIFICATION (authMiddleware.js):
  const authHeader = req.headers.authorization;
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  1. Checks header exists and starts with "Bearer "
  2. Splits off the token: authHeader.split(' ')[1]
  3. Verifies: jwt.verify(token, process.env.JWT_SECRET)
     - If VALID → decodes payload → gets { id, iat, exp }
     - If EXPIRED → throws TokenExpiredError → 401 response
     - If TAMPERED → throws JsonWebTokenError → 401 response

  4. Attaches to request: req.user = { id: decoded.id }
  5. Calls next() → request continues to controller

STEP 5 — CONTROLLER USES req.user.id:
  taskController (createTask):
    Task.create({ ...taskData, userId: req.user.id })
    ← This ensures every task knows which user created it

  taskController (getTasks):
    Task.find({ userId: req.user.id })
    ← This ensures each user ONLY sees THEIR OWN tasks!

STEP 6 — TOKEN EXPIRY & LOGOUT:
  - Token expires after 7 days automatically (enforced by JWT)
  - On LOGOUT: AuthContext removes it from localStorage
  - Removed token → no Authorization header → authMiddleware returns 401
  - ProtectedRoute redirects to Login page

--------------------------------------------------------------------------------
JWT vs SESSION (Why we use JWT)
--------------------------------------------------------------------------------

SESSIONS (old way):
  - Server stores session data in memory or database
  - Browser stores only a session ID
  - Problem: doesn't scale well (server must look up session each time)

JWT (new way / stateless):
  - Server stores NOTHING
  - All user info is IN the token itself
  - Server just verifies the signature (very fast — no DB lookup!)
  - Works great for MERN apps where frontend and backend are separate

--------------------------------------------------------------------------------
SECURITY CONSIDERATIONS
--------------------------------------------------------------------------------

1. SIGNATURE PROTECTION:
   - JWT_SECRET must be kept secret in .env file
   - NEVER commit .env to GitHub or share it
   - If someone gets JWT_SECRET → they can forge any token!

2. PAYLOAD IS NOT ENCRYPTED:
   - Anyone can decode the payload (try jwt.io in browser!)
   - So NEVER store passwords or sensitive data in the payload
   - We only store: userId, issued time, expiry time

3. LOCALSTORAGE vs COOKIES:
   - We use localStorage for simplicity
   - Production apps often use httpOnly cookies (safer against XSS attacks)
   - But localStorage is fine for a learning/demo project

4. TOKEN EXPIRY:
   - Our token expires in 7 days (expiresIn: '7d')
   - After 7 days → user must log in again to get a new token
   - This limits damage if a token is stolen

5. USER-SCOPED DATA:
   - Every task controller checks { userId: req.user.id }
   - This means even if User A somehow got User B's task _id,
     they CANNOT read or delete it because userId won't match!

--------------------------------------------------------------------------------
BCRYPT — HOW PASSWORDS ARE PROTECTED
--------------------------------------------------------------------------------

bcrypt is a password hashing algorithm used alongside JWT.

SIGNUP:
  const salt = await bcrypt.genSalt(10)       ← generates random salt (10 rounds)
  const passwordHash = await bcrypt.hash(password, salt)
  User.create({ name, email, passwordHash })   ← stores HASH, never plain password

  Example:
    plaintext: "mypass123"
    stored:    "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImtMoyCi"

LOGIN:
  const isMatch = await bcrypt.compare(password, user.passwordHash)
  ← rehashes the entered password with the same salt and compares
  → true if correct, false if wrong

WHY BCRYPT?
  - Even if MongoDB gets hacked, attacker only sees hashes
  - "10 rounds" means it does 2^10 = 1024 iterations → slow on purpose
  - Makes brute-force attacks take years instead of seconds

--------------------------------------------------------------------------------
VIVA QUESTIONS ON JWT — WITH ANSWERS
--------------------------------------------------------------------------------

Q: What is JWT and why do you use it?
A: JWT (JSON Web Token) is a stateless authentication mechanism. After login,
   the server creates a signed token containing the user's ID and sends it to
   the client. The client sends this token with every request. The server
   verifies the signature without needing to check a database — making it fast
   and scalable. I used it because it works perfectly with a React + Node.js
   separation (no shared session memory needed).

Q: What are the 3 parts of a JWT?
A: Header (algorithm type), Payload (data like userId, expiry), Signature
   (HMAC hash of header+payload using the secret key). The signature is what
   makes it tamper-proof.

Q: Is the JWT payload visible to users?
A: YES. The payload is Base64URL encoded, NOT encrypted. Anyone can decode it
   using tools like jwt.io. This is why I never store sensitive data in it —
   only the userId and timestamps.

Q: What happens if the JWT expires?
A: jwt.verify() throws a TokenExpiredError. The authMiddleware catches this and
   returns a 401 Unauthorized response. The frontend (currently) shows an error
   and the user must log in again to receive a fresh 7-day token.

Q: How do you prevent one user from accessing another user's tasks?
A: Two layers of protection:
   1. JWT token is verified — we know WHO is making the request (req.user.id)
   2. Every MongoDB query filters by userId: Task.find({ userId: req.user.id })
   So even if someone knew another user's task _id, the server would return
   "Task not found" because the userId wouldn't match.

Q: Why is JWT_SECRET important?
A: The JWT_SECRET is used to create the signature of the token. If someone
   knows the secret, they can forge any token (pretend to be any user). It must
   be kept in .env and NEVER committed to source control.

Q: What is the difference between authentication and authorization?
A: Authentication = WHO you are (verified by login/JWT)
   Authorization = WHAT you can do (verified by checking ownership in controllers)
   In this project: JWT handles authentication, and the userId check in each
   controller handles authorization.

================================================================================


================================================================================
HOW THE CALENDAR WORKS (DashboardCalendar.jsx)
================================================================================

The calendar is a pure frontend feature — it does NOT talk to the backend.
All data it displays comes from:
  1. tasks  → fetched from MongoDB (via TasksContext)
  2. events → stored in localStorage (key: "pm_events") and read via TasksContext

File: client-side/react-project/src/components/pages/dashboard/DashboardCalendar.jsx
Helper: client-side/react-project/src/utils/calendarUtils.js
Library: date-fns (for all date calculations)

--------------------------------------------------------------------------------
HOW THE CALENDAR GRID IS BUILT (getMonthGrid)
--------------------------------------------------------------------------------

Function: getMonthGrid(monthDate)  — in calendarUtils.js

Steps:
  1. Find first day of the current month   → startOfMonth(monthDate)
  2. Find last day of the current month    → endOfMonth(monthDate)
  3. Expand backwards to Sunday            → startOfWeek(start, { weekStartsOn: 0 })
  4. Expand forwards to the next Saturday  → endOfWeek(end, { weekStartsOn: 0 })
  5. Loop day by day from gridStart to gridEnd, collecting:
       { date, iso: "YYYY-MM-DD", isCurrentMonth: true/false }
  6. Group every 7 days into a "week" array
  7. Return: array of weeks (each week = array of 7 day objects)

Example — February 2026:
  Grid starts: Sunday 2026-01-25  (padding from January)
  Grid ends:   Saturday 2026-02-28
  Days outside the current month are shown in a darker background (bg-slate-950/60)

--------------------------------------------------------------------------------
HOW TASKS AND EVENTS ARE PLACED ON THE CALENDAR (itemsByDate)
--------------------------------------------------------------------------------

Built inside DashboardCalendar using useMemo (so it only recalculates when
tasks or events actually change):

  const itemsByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      const iso = dueLabelToDate(task.due, task.dueDate, today);
      map[iso].push({ ...task, type: 'task' });
    });
    events.forEach(event => {
      const iso = dueLabelToDate(event.due, event.dueDate, today);
      map[iso].push({ ...event, type: 'event' });
    });
    return map;
  }, [tasks, events]);

Result: a plain JS object where each key is a date string "YYYY-MM-DD" and
the value is an array of tasks/events due on that date.

When rendering a day cell, the calendar looks up: itemsByDate["2026-02-26"]
and renders whatever items are in that array.

--------------------------------------------------------------------------------
HOW DUE DATES ARE RESOLVED (dueLabelToDate)
--------------------------------------------------------------------------------

Function: dueLabelToDate(due, dueDate, refDate)  — in calendarUtils.js

Priority:
  1. If a task/event has an EXPLICIT dueDate (ISO string like "2026-03-15"):
       → Parse it with parseISO() and format as "YYYY-MM-DD"
  2. If no explicit dueDate, fall back to the "due" label:

  Label        → Resolved date
  ──────────────────────────────
  "Today"      → today's date
  "Tomorrow"   → today + 1 day
  "Friday"     → the coming Friday (or today if already Friday)
  "Next week"  → the coming Monday (or next Monday if today is Monday)
  "Soon"       → today's date (treated as today)
  anything else → null (not shown on calendar)

--------------------------------------------------------------------------------
HOW ITEMS ARE DISPLAYED ON EACH DAY
--------------------------------------------------------------------------------

Each day cell shows up to MAX_VISIBLE_PER_DAY = 3 items.
If there are more than 3 items: "+N more" text is shown below.

Color coding by type and priority:
  Task — High priority    → red left border    (border-l-rose-500 / bg-rose-500/10)
  Task — Medium priority  → amber left border  (border-l-amber-500 / bg-amber-500/10)
  Task — Low priority     → green left border  (border-l-emerald-500 / bg-emerald-500/10)
  Event (any)             → indigo left border (border-l-indigo-500 / bg-indigo-500/10)

Completed tasks (status === 'done') appear with:
  - 60% opacity (opacity-60)
  - Strikethrough text (line-through)

Today's date number is shown with a filled circle (bg-primary text-white).
Days outside the current month are dimmed (text-slate-500, darker background).

--------------------------------------------------------------------------------
NAVIGATION — HOW MONTH SWITCHING WORKS
--------------------------------------------------------------------------------

State:
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))

  goPrev()   → setCurrentMonth(subMonths(currentMonth, 1))
  goNext()   → setCurrentMonth(addMonths(currentMonth, 1))
  goToday()  → setCurrentMonth(startOfMonth(new Date()))

Both the grid and the itemsByDate map are recalculated via useMemo whenever
currentMonth changes.

The header shows: format(currentMonth, 'MMMM yyyy')  e.g. "February 2026"

--------------------------------------------------------------------------------
WHERE EVENTS COME FROM (vs tasks)
--------------------------------------------------------------------------------

TASKS:
  - Stored in MongoDB
  - Loaded at startup by TasksContext (GET /api/tasks)
  - Have: title, status, priority, dueDate, due label

EVENTS:
  - NOT stored in MongoDB — stored only in localStorage ("pm_events")
  - Loaded by TasksContext reading localStorage on startup
  - Have: id, title, dueDate, due label (no priority concept)
  - Events show with indigo color to distinguish from tasks

--------------------------------------------------------------------------------
LIBRARIES USED IN THE CALENDAR
--------------------------------------------------------------------------------

date-fns functions used:
  format(date, pattern)      → formats a date to a string, e.g. "February 2026"
  addDays(date, n)           → adds n days to a date
  addMonths / subMonths      → navigate months
  startOfMonth / endOfMonth  → find first/last day
  startOfWeek / endOfWeek    → expand grid to full weeks (Sun–Sat)
  isSameMonth(d, ref)        → check if day belongs to the current month
  isSameDay(d, today)        → check if a date is today
  parseISO(str)              → parse "YYYY-MM-DD" string into a JS Date
  isValid(date)              → check if a parsed date is valid
  nextMonday / nextFriday    → navigate to next Mon/Fri for due labels
  isFriday / isMonday        → check if today is already Fri/Mon

Icons used: FaChevronLeft, FaChevronRight (react-icons/fa)

--------------------------------------------------------------------------------
VIVA QUESTIONS ON THE CALENDAR
--------------------------------------------------------------------------------

Q: Where is calendar data stored?
A: Tasks come from MongoDB (via the API + TasksContext). Events come from
   localStorage under the key "pm_events". Neither requires a separate
   calendar backend — the calendar is purely a frontend view of existing data.

Q: How does the calendar know which day to put a task on?
A: The dueLabelToDate() function in calendarUtils.js resolves each task's
   "due" label (like "Today", "Tomorrow", "Friday") or explicit dueDate
   field into a "YYYY-MM-DD" string. The calendar uses that string as a key
   in its itemsByDate map, so every task lands on the correct day cell.

Q: What is useMemo used for here?
A: useMemo caches the expensive calculations (building the day grid and
   grouping tasks by date) so they only run again when their dependencies
   change — currentMonth for the grid, and tasks/events for itemsByDate.
   This prevents unnecessary recalculations on every re-render.

Q: What happens if more than 3 tasks fall on the same day?
A: Only the first 3 are rendered as pills. A small "+N more" label appears
   below them to indicate extra items exist.

Q: How are completed tasks shown differently?
A: Completed tasks (status === 'done') are rendered with line-through text and
   60% opacity (opacity-60), so they are visually distinct but still visible
   on the calendar.

Q: How is "today" highlighted?
A: The isToday() function in calendarUtils.js compares each day's ISO string
   to today's date using isSameDay from date-fns. If it matches, the day
   number is wrapped in a filled primary-color circle.

================================================================================












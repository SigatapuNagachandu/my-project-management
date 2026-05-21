## TaskFlow – Project Management UI (React + Tailwind)

TaskFlow is a small project-management style web app built with **React**, **Vite**, and **Tailwind CSS**.  
It includes a marketing/home page, working **signup & login** flow (stored in `localStorage`), and a protected **dashboard** with task management UI.

### Tech stack

- **React + Vite**
- **Tailwind CSS** (utility-first styling)
- **react-router-dom** for routing
- **react-hot-toast** for feedback

### Getting started

1. **Install dependencies**

   ```bash
   cd react-project
   npm install
   ```

2. **Run the dev server**

   ```bash
   npm run dev
   ```

   Then open the URL that Vite prints (usually `http://localhost:5173`).

### App structure

- `src/App.jsx` – Router setup and route protection
- `src/context/AuthContext.jsx` – Simple client-side auth using `localStorage`
- `src/components/pages/Home.jsx` – Landing page with Tailwind styling
- `src/components/pages/Login.jsx` – Login form that authenticates via `AuthContext`
- `src/components/pages/Signup.jsx` – Signup form that creates a local account
- `src/components/pages/Dashboard.jsx` – Project management dashboard UI with quick-add tasks

### Auth behaviour

- **Signup** creates a user (name, email, password) in `localStorage`.
- **Login** checks credentials against stored users.
- On success, you are redirected to `/dashboard`.
- `/dashboard` is **protected** – you must be logged in to access it.
- **Logout** clears the current user from `localStorage`.

> This is a demo-only, front-end–only implementation. Do not use the auth logic as‑is in production.


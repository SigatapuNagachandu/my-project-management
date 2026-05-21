// Import the useState hook from React to manage component state
import { useState } from 'react';
// Import various icons from react-icons library for UI elements
import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaPlus,
  FaCalendarAlt,
  FaInbox,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaTasks,
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa';
// Import the custom authentication hook to access user data and logout function
import { useAuth } from '../../context/AuthContext';

// Define color styles for different task priorities
// Each priority level has specific background, text, and ring colors
const PRIORITY_COLORS = {
  high: 'bg-rose-100 text-rose-700 ring-rose-500/20',
  medium: 'bg-amber-100 text-amber-700 ring-amber-500/20',
  low: 'bg-emerald-100 text-emerald-700 ring-emerald-500/20',
};

// Define color styles for different task statuses
// These are background colors that display as colored dots next to status
const STATUS_COLORS = {
  'in-progress': 'bg-sky-500',
  todo: 'bg-slate-400',
  done: 'bg-emerald-500',
};

// Main Dashboard component function
function Dashboard() {
  // Get user data and logout function from authentication context
  const { user, logout } = useAuth();

  // State to track which navigation tab is currently active (overview, tasks, projects, etc.)
  const [activeTab, setActiveTab] = useState('overview');

  // State to manage the list of tasks - initially populated with sample tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Design homepage',
      project: 'Website redesign',
      priority: 'high',
      due: 'Today',
      status: 'in-progress',
    },
    {
      id: 2,
      title: 'Write API documentation',
      project: 'Backend platform',
      priority: 'medium',
      due: 'Tomorrow',
      status: 'todo',
    },
    {
      id: 3,
      title: 'Sprint planning',
      project: 'Core team',
      priority: 'low',
      due: 'Next week',
      status: 'done',
    },
  ]);

  // State to store the form input values for creating a new task
  const [newTask, setNewTask] = useState({
    title: '',
    project: '',
    priority: 'medium',
  });

  // Array of stat objects to display in the dashboard cards
  // Each stat shows a label, value, icon, and gradient color
  const stats = [
    {
      label: 'Total projects',
      value: '4',
      icon: <FaProjectDiagram />,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Active tasks',
      // Calculate active tasks by filtering tasks that are not marked as done
      value: tasks.filter((t) => t.status !== 'done').length,
      icon: <FaTasks />,
      color: 'from-sky-500 to-cyan-500',
    },
    {
      label: 'Completed',
      // Calculate completed tasks by filtering tasks with status 'done'
      value: tasks.filter((t) => t.status === 'done').length,
      icon: <FaCheckCircle />,
      color: 'from-emerald-500 to-lime-500',
    },
    {
      label: 'At risk',
      // Calculate at-risk tasks by filtering tasks with high priority
      value: tasks.filter((t) => t.priority === 'high').length,
      icon: <FaExclamationTriangle />,
      color: 'from-rose-500 to-orange-500',
    },
  ];

  // Handler function to add a new task when the form is submitted
  const handleAddTask = (e) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Validate that the task title is not empty (after trimming whitespace)
    if (!newTask.title.trim()) return;

    // Update the tasks array by adding the new task at the beginning
    setTasks((prev) => [
      {
        id: Date.now(), // Use current timestamp as unique ID
        title: newTask.title.trim(), // Clean up the title
        project: newTask.project.trim() || 'Inbox', // Use project name or default to 'Inbox'
        priority: newTask.priority, // Use selected priority
        due: 'Soon', // Default due date for new tasks
        status: 'todo', // New tasks start with 'todo' status
      },
      ...prev, // Spread the existing tasks after the new one
    ]);

    // Reset the form inputs to empty values
    setNewTask({
      title: '',
      project: '',
      priority: 'medium',
    });
  };

  // Handler function to toggle a task's status between 'todo' and 'done'
  const toggleTaskStatus = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        // Only modify the task with matching ID
        if (task.id !== id) return task;

        // Toggle: if done, change to todo; if not done, change to done
        const nextStatus = task.status === 'done' ? 'todo' : 'done';

        // Return the updated task with new status
        return { ...task, status: nextStatus };
      })
    );
  };

  // Main render structure - flex container with sidebar and main content
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* LEFT SIDEBAR - Hidden on small screens, visible on lg breakpoint and up */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950/80 px-4 py-6 backdrop-blur lg:flex lg:flex-col">
        {/* Logo and branding section */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Taskly</h2>
            <p className="text-xs text-slate-400">Project workspace</p>
          </div>
        </div>

        {/* Navigation menu - main sidebar buttons */}
        <nav className="mt-8 space-y-1 text-sm">
          {/* Overview button - links to overview tab */}
          <button
            type="button"
            // Apply different styling based on whether this tab is active
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-100'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar className="text-sky-400" />
            <span>Overview</span>
          </button>

          {/* My tasks button */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
              activeTab === 'tasks'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-100'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            <FaTasks className="text-indigo-400" />
            <span>My tasks</span>
          </button>

          {/* Projects button */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
              activeTab === 'projects'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-100'
            }`}
            onClick={() => setActiveTab('projects')}
          >
            <FaProjectDiagram className="text-violet-400" />
            <span>Projects</span>
          </button>

          {/* Calendar button */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-100'
            }`}
            onClick={() => setActiveTab('calendar')}
          >
            <FaCalendarAlt className="text-emerald-400" />
            <span>Calendar</span>
          </button>

          {/* Inbox button */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
              activeTab === 'inbox'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-100'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            <FaInbox className="text-pink-400" />
            <span>Inbox</span>
          </button>
        </nav>

        {/* Bottom section - Settings and Logout buttons */}
        <div className="mt-auto space-y-1 border-t border-white/5 pt-4 text-sm">
          {/* Settings button */}
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-slate-400 hover:bg-slate-900/40 hover:text-slate-100"
          >
            <FaCog />
            <span>Settings</span>
          </button>

          {/* Logout button - calls logout function on click */}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-rose-400 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA - Takes up remaining space */}
      <main className="flex min-h-screen flex-1 flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        {/* HEADER - Contains search bar, notifications, and user profile */}
        <header className="border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            {/* Left section - Search bar */}
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                {/* Search icon positioned inside the input */}
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/70 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
                />
              </div>
            </div>

            {/* Right section - Action buttons, notifications, and user profile */}
            <div className="flex items-center gap-3">
              {/* New task button - hidden on small screens */}
              <button
                type="button"
                className="hidden items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white shadow-soft hover:bg-secondary sm:inline-flex"
              >
                <FaPlus />
                <span>New task</span>
              </button>

              {/* Notifications button - shows a red badge with count */}
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500"
              >
                <FaBell className="text-sm" />
                {/* Badge showing notification count */}
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                  3
                </span>
              </button>

              {/* User profile section - shows avatar, name, and email */}
              <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5">
                <FaUserCircle className="text-2xl text-slate-300" />
                {/* User info hidden on small screens */}
                <div className="hidden text-xs leading-tight sm:block">
                  <p className="font-medium text-slate-100">
                    {user?.name || 'Member'}
                  </p>
                  <p className="text-slate-400">
                    {user?.email || 'Demo workspace'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          {/* STATS SECTION - Shows 4 key metrics */}
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Loop through stats array and create a card for each */}
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="card border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left side - Label and value */}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {stat.value}
                    </p>
                  </div>
                  {/* Right side - Icon with gradient background */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-soft`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* TWO-COLUMN SECTION - Tasks list on left, Today's focus and Upcoming on right */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
            {/* LEFT COLUMN - Tasks list with form to add new tasks */}
            <section className="space-y-4">
              {/* Header with title and task count */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Recent tasks
                </h2>
                <span className="text-xs text-slate-500">
                  {tasks.length}
                  {' '}
                  tasks
                </span>
              </div>

              {/* FORM TO ADD NEW TASK */}
              <form
                onSubmit={handleAddTask}
                className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-3 text-xs sm:flex-row sm:items-center"
              >
                {/* Task title input */}
                <input
                  type="text"
                  placeholder="Quick add a task..."
                  value={newTask.title}
                  // Update the title in state whenever user types
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
                />

                {/* Project name input (optional) */}
                <input
                  type="text"
                  placeholder="Project (optional)"
                  value={newTask.project}
                  // Update the project in state whenever user types
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, project: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
                />

                {/* Priority dropdown - allows selection of high, medium, or low */}
                <select
                  value={newTask.priority}
                  // Update the priority in state when user selects
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Submit button to add the task */}
                <button
                  type="submit"
                  className="btn-primary flex-shrink-0 justify-center px-4 py-2 text-xs"
                >
                  Add
                </button>
              </form>

              {/* TASKS LIST - Display all tasks */}
              <div className="space-y-3">
                {/* Loop through each task and render a task card */}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left side - Checkbox, title, project, and due date */}
                    <div className="flex items-start gap-3">
                      {/* Checkbox button to toggle task completion */}
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-slate-500 bg-slate-900 text-[10px]"
                      >
                        {/* Show checkmark if task is done */}
                        {task.status === 'done' && (
                          <span className="text-emerald-400">✓</span>
                        )}
                      </button>

                      {/* Task details */}
                      <div>
                        {/* Task title */}
                        <p className="font-medium text-slate-50">
                          {task.title}
                        </p>
                        {/* Project name and due date */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          {/* Project badge */}
                          <span className="rounded-full bg-slate-800/80 px-2 py-0.5">
                            {task.project}
                          </span>
                          {/* Due date with clock icon */}
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <FaClock className="text-[10px]" />
                            {task.due}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Priority and Status badges */}
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      {/* Priority badge with appropriate color */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${
                          PRIORITY_COLORS[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Status badge with colored dot */}
                      <span className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300">
                        {/* Colored dot representing status */}
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            STATUS_COLORS[task.status]
                          }`}
                        />
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RIGHT COLUMN - Today's focus and Upcoming events */}
            <section className="space-y-4">
              {/* TODAY'S FOCUS CARD */}
              <div className="card border border-white/5 bg-slate-900/80">
                <h3 className="text-sm font-semibold text-slate-100">
                  Today&apos;s focus
                </h3>
                {/* Description of the focus section */}
                <p className="mt-2 text-xs text-slate-400">
                  Pick 1–3 tasks you absolutely want to finish today.
                  Small wins compound into big progress.
                </p>
                {/* List of suggested focus tasks */}
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Review sprint board with your team
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    Move blocked tasks forward
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Close at least 2 done tasks
                  </li>
                </ul>
              </div>

              {/* UPCOMING EVENTS CARD */}
              <div className="card border border-white/5 bg-slate-900/80">
                <h3 className="text-sm font-semibold text-slate-100">
                  Upcoming
                </h3>
                {/* List of upcoming events/tasks */}
                <div className="mt-3 space-y-3 text-xs text-slate-300">
                  {/* Event 1 */}
                  <div className="flex items-center justify-between">
                    <span>Planning session</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                      Tomorrow
                    </span>
                  </div>
                  {/* Event 2 */}
                  <div className="flex items-center justify-between">
                    <span>Release checklist</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                      Friday
                    </span>
                  </div>
                  {/* Event 3 */}
                  <div className="flex items-center justify-between">
                    <span>Retro meeting</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                      Next week
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// Export the Dashboard component as default so it can be imported elsewhere
export default Dashboard;
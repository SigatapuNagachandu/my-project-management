import { useRef, useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TasksContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard', end: true, icon: FaChartBar, label: 'Overview', iconClass: 'text-sky-500 dark:text-sky-400' },
  { to: '/dashboard/tasks', end: false, icon: FaTasks, label: 'My tasks', iconClass: 'text-indigo-500 dark:text-indigo-400' },
  { to: '/dashboard/projects', end: false, icon: FaProjectDiagram, label: 'Projects', iconClass: 'text-violet-500 dark:text-violet-400' },
  { to: '/dashboard/calendar', end: false, icon: FaCalendarAlt, label: 'Calendar', iconClass: 'text-emerald-500 dark:text-emerald-400' },
  { to: '/dashboard/inbox', end: false, icon: FaInbox, label: 'Inbox', iconClass: 'text-pink-500 dark:text-pink-400' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    unreadCount,
    notifications,
    markNotificationsRead,
    user: _tasksUser,
  } = useTasks();
  const quickAddRef = useRef(null);
  const notifRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [notifOpen]);

  const handleNewTask = () => {
    navigate('/dashboard');
    setTimeout(() => {
      quickAddRef.current?.scrollIntoView({ behavior: 'smooth' });
      const input = document.querySelector('[data-quick-add-title]');
      input?.focus();
    }, 100);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 dark:border-white/10 dark:bg-slate-950/80 dark:backdrop-blur lg:flex lg:flex-col transition-colors duration-300">
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Taskly</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Project workspace</p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <nav className="mt-8 space-y-1 text-sm">
          {navItems.map(({ to, end, icon: Icon, label, iconClass }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${isActive
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? 'text-current' : iconClass} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-200 pt-4 text-sm dark:border-white/5">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${isActive
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-slate-100'
              }`
            }
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>
          <button
            type="button"
            onClick={() => {
              navigate('/');
              setTimeout(logout, 10);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col bg-slate-50 dark:bg-slate-950 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 transition-colors duration-300">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-100/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNewTask}
                className="hidden items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white shadow-soft hover:bg-secondary sm:inline-flex"
              >
                <FaPlus />
                <span>New task</span>
              </button>

              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-500"
                  onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); }}
                >
                  <FaBell className="text-sm" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div className={`absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 ${notifOpen ? '' : 'hidden'}`}>
                  <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markNotificationsRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-3 text-xs text-slate-500">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`border-b border-slate-100 px-3 py-2 last:border-0 dark:border-slate-800 ${n.read ? 'opacity-75' : ''}`}
                        >
                          <p className="text-xs text-slate-700 dark:text-slate-200">{n.text}</p>
                          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{n.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-slate-100/50 px-3 py-1.5 dark:bg-slate-900/70">
                <FaUserCircle className="text-2xl text-slate-400 dark:text-slate-300" />
                <div className="hidden text-xs leading-tight sm:block">
                  <p className="font-medium text-slate-700 dark:text-slate-100">{user?.name || 'Member'}</p>
                  <p className="text-slate-500 dark:text-slate-400">{user?.email || 'Demo workspace'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          <Outlet context={{ quickAddRef }} />
        </div>
      </main>
    </div>
  );
}

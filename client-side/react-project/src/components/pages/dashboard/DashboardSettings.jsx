import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  FaUser,
  FaMoon,
  FaSun,
  FaBell,
  FaTrash,
  FaDesktop,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function DashboardSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete all local data and log you out.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and workspace preferences.</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 dark:border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <FaUser />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your personal information</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</label>
            <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {user?.name || 'User'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {user?.email || 'user@example.com'}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 dark:border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
            <FaMoon />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Appearance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customize how Taskly looks on your device</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <button
              onClick={() => setTheme('light')}
              className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all ${theme === 'light'
                ? 'border-primary bg-primary/5 ring-1 ring-primary dark:border-primary dark:bg-primary/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/20">
                <FaSun />
              </div>
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>Light</span>
              {theme === 'light' && <div className="absolute right-2 top-2 text-primary"><FaCheck className="text-xs" /></div>}
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all ${theme === 'dark'
                ? 'border-primary bg-primary/5 ring-1 ring-primary dark:border-primary dark:bg-primary/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white">
                <FaMoon />
              </div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>Dark</span>
              {theme === 'dark' && <div className="absolute right-2 top-2 text-primary"><FaCheck className="text-xs" /></div>}
            </button>

            <button
              onClick={() => toast('System theme sync coming soon!')}
              className="group relative flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-4 opacity-50 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <FaDesktop />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">System</span>
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 dark:border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <FaBell />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage how you receive updates</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Receive daily summaries and critical alerts</p>
            </div>
            <button
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`relative h-6 w-11 rounded-full transition-colors ${emailNotifs ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Receive real-time updates in your browser</p>
            </div>
            <button
              onClick={() => setPushNotifs(!pushNotifs)}
              className={`relative h-6 w-11 rounded-full transition-colors ${pushNotifs ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${pushNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 dark:border-rose-900/30 dark:bg-rose-950/10">
        <div className="flex items-center gap-4 border-b border-rose-200 pb-4 dark:border-rose-900/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <FaExclamationTriangle />
          </div>
          <div>
            <h2 className="text-base font-semibold text-rose-700 dark:text-rose-400">Danger Zone</h2>
            <p className="text-xs text-rose-600/80 dark:text-rose-500/80">Irreversible actions</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Delete Workspace</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clear all tasks, projects, and settings from this browser.</p>
            </div>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 rounded-lg bg-white border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <FaTrash />
              Delete Everything
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

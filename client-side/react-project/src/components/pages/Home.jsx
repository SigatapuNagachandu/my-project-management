import { Link } from 'react-router-dom';
import {
  FaRocket,
  FaTasks,
  FaUsers,
  FaChartLine,
} from 'react-icons/fa';

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">

      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-soft">
              <FaRocket className="text-lg" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Taskly
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            <Link to="/signup" className="btn-secondary">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.22),_transparent_55%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-1 flex-col items-center px-4 py-20 text-center">
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Project management
            {' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              made simple
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-balance text-sm text-slate-300 sm:text-base">
            Organize, track, and manage your projects like a pro.
            Tailored for modern teams that want the power of ClickUp
            with the simplicity of a single dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary">Start for free</Link>
            <Link to="/login" className="btn-secondary">Sign in</Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            No credit card required. Local storage only – perfect for demos.
          </p>
        </div>
      </section>

      <section className="bg-slate-950 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Everything you need to ship projects
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Visualize work, keep your team aligned, and stay on top of deadlines.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <div className="card border border-white/5 bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                <FaTasks />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">Task management</h3>
              <p className="mt-2 text-sm text-slate-400">
                Create, assign, and track tasks with statuses and priorities.
              </p>
            </div>

            <div className="card border border-white/5 bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <FaUsers />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">Team collaboration</h3>
              <p className="mt-2 text-sm text-slate-400">
                Share a single source of truth for every project in your team.
              </p>
            </div>

            <div className="card border border-white/5 bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                <FaChartLine />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">Progress tracking</h3>
              <p className="mt-2 text-sm text-slate-400">
                See tasks by status and priority to spot risks early.
              </p>
            </div>

            <div className="card border border-white/5 bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20 text-pink-300">
                <FaRocket />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">Fast &amp; lightweight</h3>
              <p className="mt-2 text-sm text-slate-400">
                Built with React and Tailwind for snappy, modern UX.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
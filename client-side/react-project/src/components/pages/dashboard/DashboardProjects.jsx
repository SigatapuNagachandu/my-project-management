import { FaTasks, FaCheckCircle } from 'react-icons/fa';
import { useTasks } from '../../../context/TasksContext';

export default function DashboardProjects() {
  const { tasks, projects } = useTasks();

  const projectStats = projects.map((name) => {
    const projectTasks = tasks.filter((t) => (t.project || 'Inbox') === name);
    return {
      name,
      total: projectTasks.length,
      done: projectTasks.filter((t) => t.status === 'done').length,
      tasks: projectTasks,
    };
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">Projects</h1>
        <span className="text-xs text-slate-500">{projects.length} projects</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projectStats.length === 0 ? (
          <p className="col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-500">
            No projects yet. Add tasks with a project name from the Overview.
          </p>
        ) : (
          projectStats.map((proj) => (
            <div
              key={proj.name}
              className="card border border-white/5 bg-slate-900/80 p-4"
            >
              <h3 className="font-medium text-slate-100">{proj.name}</h3>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <FaTasks className="text-sky-400" />
                  {proj.total} tasks
                </span>
                <span className="flex items-center gap-1">
                  <FaCheckCircle className="text-emerald-400" />
                  {proj.done} done
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {proj.tasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg bg-slate-800/50 px-2 py-1.5 text-[11px]"
                  >
                    <span className={t.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300'}>
                      {t.title}
                    </span>
                    <span className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-400">{t.status}</span>
                  </div>
                ))}
                {proj.tasks.length > 3 && (
                  <p className="text-[11px] text-slate-500">+{proj.tasks.length - 3} more</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

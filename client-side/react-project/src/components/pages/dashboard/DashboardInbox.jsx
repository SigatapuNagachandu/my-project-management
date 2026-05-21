import { FaClock, FaTrash } from 'react-icons/fa';
import { useTasks } from '../../../context/TasksContext';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  high: 'bg-rose-100 text-rose-700 ring-rose-500/20',
  medium: 'bg-amber-100 text-amber-700 ring-amber-500/20',
  low: 'bg-emerald-100 text-emerald-700 ring-emerald-500/20',
};

const STATUS_COLORS = {
  'in-progress': 'bg-sky-500',
  todo: 'bg-slate-400',
  done: 'bg-emerald-500',
};

export default function DashboardInbox() {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const inboxTasks = tasks.filter((t) => !t.project || t.project === 'Inbox');

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteTask(id);
    toast.success('Task removed');
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">Inbox</h1>
        <span className="text-xs text-slate-500">{inboxTasks.length} tasks</span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Tasks without a project or with project &quot;Inbox&quot;.
      </p>

      <div className="space-y-3">
        {inboxTasks.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-500">
            Inbox is empty. Add a task without a project from Overview.
          </p>
        ) : (
          inboxTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-slate-500 bg-slate-900 text-[10px]"
                >
                  {task.status === 'done' && <span className="text-emerald-400">✓</span>}
                </button>
                <div className="min-w-0">
                  <p className={`font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-50'}`}>
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <FaClock className="text-[10px]" />
                      {task.due}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${PRIORITY_COLORS[task.priority]}`}
                >
                  {task.priority}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[task.status]}`} />
                  {task.status}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(task.id, e)}
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Delete task"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

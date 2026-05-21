import { useState } from 'react';
import { useTasks } from '../../../context/TasksContext';
import TaskItem from './TaskItem';
import KanbanBoard from './KanbanBoard';
import { FaList, FaColumns } from 'react-icons/fa';

export default function DashboardTasks() {
  const { filteredTasks } = useTasks();
  const [view, setView] = useState('list');

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My tasks</h1>
          <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setView('list')}
              className={`rounded p-1.5 text-xs transition-colors ${view === 'list'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
              title="List view"
            >
              <FaList />
            </button>
            <button
              onClick={() => setView('board')}
              className={`rounded p-1.5 text-xs transition-colors ${view === 'board'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
              title="Board view"
            >
              <FaColumns />
            </button>
          </div>
        </div>
        <span className="text-xs text-slate-500">{filteredTasks.length} tasks</span>
      </div>

      {view === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/70">
              No tasks match your search. Try changing the search or add tasks from Overview.
            </p>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </div>
      ) : (
        <KanbanBoard />
      )}
    </>
  );
}

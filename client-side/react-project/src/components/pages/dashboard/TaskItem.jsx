import { useState } from 'react';
import {
    FaClock,
    FaTrash,
    FaChevronDown,
    FaChevronUp,
    FaPlus,
    FaCheck,
} from 'react-icons/fa';
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

export default function TaskItem({ task }) {
    const { toggleTaskStatus, deleteTask, addSubtask, toggleSubtaskStatus, deleteSubtask } = useTasks();
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteTask(task.id);
        toast.success('Task removed');
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        addSubtask(task.id, newSubtask.trim());
        setNewSubtask('');
        toast.success('Subtask added');
    };

    const handleDeleteSubtask = (subId) => {
        deleteSubtask(task.id, subId);
        toast.success('Subtask removed');
    };

    const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
    const totalSubtasks = (task.subtasks || []).length;
    const progress = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 shadow-sm dark:shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-[10px] hover:border-emerald-400 transition-colors dark:border-slate-500 dark:bg-slate-900"
                    >
                        {task.status === 'done' && <span className="text-emerald-500 dark:text-emerald-400">✓</span>}
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className={`font-medium ${task.status === 'done' ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-50'}`}>
                                {task.title}
                            </p>
                            {totalSubtasks > 0 && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    ({completedSubtasks}/{totalSubtasks})
                                </span>
                            )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800/80">{task.project}</span>
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
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[task.status]}`} />
                        {task.status}
                    </span>
                    <button
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        className="flex items-center gap-1 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Toggle subtasks"
                    >
                        {totalSubtasks > 0 && (
                            <span className="text-[10px] font-medium">{progress}%</span>
                        )}
                        {showSubtasks ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        aria-label="Delete task"
                    >
                        <FaTrash className="text-sm" />
                    </button>
                </div>
            </div>

            {showSubtasks && (
                <div className="mt-3 border-t border-slate-100 pt-3 pl-8 dark:border-slate-800">
                    <div className="space-y-2">
                        {(task.subtasks || []).map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleSubtaskStatus(task.id, sub.id)}
                                        className={`flex h-3.5 w-3.5 items-center justify-center rounded border text-[8px] transition-colors ${sub.completed
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500'
                                            : 'border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900/50'
                                            }`}
                                    >
                                        {sub.completed && <FaCheck />}
                                    </button>
                                    <span className={sub.completed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}>
                                        {sub.title}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteSubtask(sub.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity dark:text-slate-500 dark:hover:text-rose-400"
                                >
                                    <FaTrash className="text-xs" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddSubtask} className="mt-3 flex items-center gap-2">
                        <input
                            type="text"
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            placeholder="Add a subtask..."
                            className="flex-1 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600"
                        />
                        <button
                            type="submit"
                            disabled={!newSubtask.trim()}
                            className="rounded bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                            <FaPlus className="text-xs" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

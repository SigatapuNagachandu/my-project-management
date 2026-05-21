import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO, subDays, isSameDay } from 'date-fns';
import {
  FaProjectDiagram,
  FaTasks,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTasks } from '../../../context/TasksContext';
import toast from 'react-hot-toast';
import TaskItem from './TaskItem';

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

export default function DashboardOverview() {
  const { quickAddRef } = useOutletContext() || {};
  const {
    tasks,
    filteredTasks,
    projects,
    addTask,
    toggleTaskStatus,
    events,
    todayFocus,
  } = useTasks();

  const [newTask, setNewTask] = useState({
    title: '',
    project: '',
    priority: 'medium',
    date: '',
  });

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#f43f5e' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const activityData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayName = format(date, 'EEE');

    const addedCount = tasks.filter(t =>
      t.createdAt && isSameDay(parseISO(t.createdAt), date)
    ).length;

    const completedCount = tasks.filter(t =>
      t.completedAt && isSameDay(parseISO(t.completedAt), date)
    ).length;

    activityData.push({
      name: dayName,
      added: addedCount,
      completed: completedCount
    });
  }

  const stats = [
    {
      label: 'Total projects',
      value: projects.length,
      icon: <FaProjectDiagram />,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Active tasks',
      value: tasks.filter((t) => t.status !== 'done').length,
      icon: <FaTasks />,
      color: 'from-sky-500 to-cyan-500',
    },
    {
      label: 'Completed',
      value: tasks.filter((t) => t.status === 'done').length,
      icon: <FaCheckCircle />,
      color: 'from-emerald-500 to-lime-500',
    },
    {
      label: 'At risk',
      value: tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length,
      icon: <FaExclamationTriangle />,
      color: 'from-rose-500 to-orange-500',
    },
  ];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Enter a task title');
      return;
    }
    let formattedDate = 'Soon';
    if (newTask.date) {
      const date = parseISO(newTask.date);
      if (isToday(date)) formattedDate = 'Today';
      else if (isTomorrow(date)) formattedDate = 'Tomorrow';
      else formattedDate = format(date, 'MMM d');
    }

    addTask({
      title: newTask.title.trim(),
      project: newTask.project.trim() || 'Inbox',
      priority: newTask.priority,
      due: formattedDate,
      dueDate: newTask.date,
      status: 'todo',
    });
    setNewTask({ title: '', project: '', priority: 'medium', date: '' });
    toast.success('Task added');
  };

  const upcomingItems = [
    ...tasks
      .filter((t) => t.due && t.due !== 'Soon' && t.status !== 'done')
      .slice(0, 3)
      .map((t) => ({ id: `task-${t.id}`, title: t.title, due: t.due, type: 'task' })),
    ...events.slice(0, 3).map((e) => ({ ...e, type: 'event' })),
  ].sort((a, b) => {
    const order = { Today: 0, Tomorrow: 1, Friday: 2, 'Next week': 3, Soon: 4 };
    return (order[a.due] ?? 5) - (order[b.due] ?? 5);
  }).slice(0, 5);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card border border-slate-200 bg-white dark:border-white/5 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-soft`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card h-80 border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-slate-900/80 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={activityData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="added" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card h-80 border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-slate-900/80 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 -mt-2">
            {priorityData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        <section className="space-y-4" ref={quickAddRef}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Recent tasks
            </h2>
            <span className="text-xs text-slate-500">
              {filteredTasks.length} tasks
            </span>
          </div>

          <form
            onSubmit={handleAddTask}
            className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-3 text-xs sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900/60"
          >
            <input
              type="text"
              data-quick-add-title
              placeholder="Quick add a task..."
              value={newTask.title}
              onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <input
              type="text"
              placeholder="Project (optional)"
              value={newTask.project}
              onChange={(e) => setNewTask((prev) => ({ ...prev, project: e.target.value }))}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <input
              type="date"
              value={newTask.date}
              onChange={(e) => setNewTask((prev) => ({ ...prev, date: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button type="submit" className="btn-primary flex-shrink-0 justify-center px-4 py-2 text-xs">
              Add
            </button>
          </form>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/70">
                No tasks yet. Add one above or use the search to filter.
              </p>
            ) : (
              filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="card border border-slate-200 bg-white dark:border-white/5 dark:bg-slate-900/80 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Today&apos;s focus</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Pick 1–3 tasks you absolutely want to finish today. Small wins compound into big progress.
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {todayFocus.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-emerald-400' : i === 1 ? 'bg-sky-400' : 'bg-amber-400'
                      }`}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card border border-slate-200 bg-white dark:border-white/5 dark:bg-slate-900/80 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upcoming</h3>
            <div className="mt-3 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              {upcomingItems.length === 0 ? (
                <p className="text-slate-500">Nothing upcoming. Add tasks with due dates.</p>
              ) : (
                upcomingItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.due}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

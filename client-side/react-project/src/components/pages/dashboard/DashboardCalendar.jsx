import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, isSameMonth, startOfMonth } from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTasks } from '../../../context/TasksContext';
import { getMonthGrid, dueLabelToDate, isToday } from '../../../utils/calendarUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_COLORS = {
  high: 'border-l-rose-500 bg-rose-500/10',
  medium: 'border-l-amber-500 bg-amber-500/10',
  low: 'border-l-emerald-500 bg-emerald-500/10',
};

const EVENT_BORDER = 'border-l-indigo-500 bg-indigo-500/10';

const MAX_VISIBLE_PER_DAY = 3;

export default function DashboardCalendar() {
  const { tasks, events } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const itemsByDate = useMemo(() => {
    const map = {};
    const refDate = new Date();

    tasks.forEach((t) => {
      const due = t.due || 'Soon';
      const iso = dueLabelToDate(due, t.dueDate, refDate);
      if (!iso) return;
      if (!map[iso]) map[iso] = [];
      map[iso].push({ ...t, type: 'task' });
    });

    events.forEach((e) => {
      const due = e.due || 'Soon';
      const iso = dueLabelToDate(due, e.dueDate, refDate);
      if (!iso) return;
      if (!map[iso]) map[iso] = [];
      map[iso].push({ ...e, type: 'event', id: `ev-${e.id}` });
    });

    return map;
  }, [tasks, events]);

  const grid = useMemo(() => getMonthGrid(currentMonth), [currentMonth]);

  const goPrev = () => setCurrentMonth((m) => subMonths(m, 1));
  const goNext = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToday = () => setCurrentMonth(startOfMonth(new Date()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-slate-100">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/80"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900/80">
            <button
              type="button"
              onClick={goPrev}
              className="flex h-9 w-9 items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              aria-label="Previous month"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-medium text-slate-100">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              aria-label="Next month"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 overflow-hidden shadow-lg">
        <div className="grid grid-cols-7 border-b border-slate-700/80 bg-slate-800/50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium uppercase tracking-wider text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.flatMap((week, wi) =>
            week.map((day) => {
              const iso = day.iso;
              const items = itemsByDate[iso] || [];
              const isCurrentMonth = day.isCurrentMonth;
              const todayActive = isToday(iso);

              return (
                <div
                  key={`${wi}-${iso}`}
                  className={`min-h-[100px] border-b border-r border-slate-700/60 p-1.5 sm:min-h-[120px] sm:p-2 ${!isCurrentMonth ? 'bg-slate-950/60' : 'bg-slate-900/30'
                    }`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium sm:h-8 sm:w-8 ${todayActive
                        ? 'bg-primary text-white'
                        : isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-500'
                        }`}
                    >
                      {format(day.date, 'd')}
                    </div>
                    <div className="mt-1 flex flex-1 flex-col gap-0.5 overflow-hidden">
                      {items.slice(0, MAX_VISIBLE_PER_DAY).map((item) => (
                        <div
                          key={item.type === 'task' ? item.id : item.id}
                          className={`rounded-r border-l-2 px-1.5 py-0.5 text-[11px] leading-tight truncate ${item.type === 'task'
                            ? PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.medium
                            : EVENT_BORDER
                            } ${item.type === 'task' && item.status === 'done' ? 'opacity-60 line-through' : ''}`}
                          title={item.title}
                        >
                          {item.title}
                        </div>
                      ))}
                      {items.length > MAX_VISIBLE_PER_DAY && (
                        <div className="px-1.5 py-0.5 text-[10px] text-slate-500">
                          +{items.length - MAX_VISIBLE_PER_DAY} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-rose-500/80" />
          High priority
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-amber-500/80" />
          Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500/80" />
          Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-indigo-500/80" />
          Event
        </span>
      </div>
    </div>
  );
}

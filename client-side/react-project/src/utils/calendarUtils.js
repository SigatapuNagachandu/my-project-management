import {
  addDays,
  format,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
  isValid,
  nextMonday,
  nextFriday,
  isFriday,
  isMonday,
} from 'date-fns';

/**
 * Resolve a task/event "due" label (and optional dueDate) to a concrete date string YYYY-MM-DD.
 * Uses refDate as "today" for relative labels.
 */
export function dueLabelToDate(due, dueDate, refDate = new Date()) {
  if (dueDate && typeof dueDate === 'string') {
    const d = parseISO(dueDate);
    return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
  }
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  switch (due) {
    case 'Today':
      return format(today, 'yyyy-MM-dd');
    case 'Tomorrow':
      return format(addDays(today, 1), 'yyyy-MM-dd');
    case 'Friday': {
      const nextF = isFriday(today) ? today : nextFriday(today);
      return format(nextF, 'yyyy-MM-dd');
    }
    case 'Next week': {
      const nextM = isMonday(today) ? addDays(today, 7) : nextMonday(today);
      return format(nextM, 'yyyy-MM-dd');
    }
    case 'Soon':
      return format(today, 'yyyy-MM-dd');
    default:
      return null;
  }
}

/**
 * Get calendar grid for a month: array of weeks, each week is array of { date, isCurrentMonth, iso }.
 */
export function getMonthGrid(monthDate) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const gridStart = startOfWeek(start, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(end, { weekStartsOn: 0 });

  const weeks = [];
  let week = [];
  let d = new Date(gridStart);

  while (d <= gridEnd) {
    week.push({
      date: d,
      iso: format(d, 'yyyy-MM-dd'),
      isCurrentMonth: isSameMonth(d, monthDate),
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    d = addDays(d, 1);
  }
  if (week.length) weeks.push(week);

  return weeks;
}

export function isToday(dateOrIso) {
  const d = typeof dateOrIso === 'string' ? parseISO(dateOrIso) : dateOrIso;
  return isSameDay(d, new Date());
}

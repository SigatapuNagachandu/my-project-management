import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const EVENTS_KEY = 'pm_events';
const NOTIFICATIONS_KEY = 'pm_notifications';
const FOCUS_KEY = 'pm_today_focus';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/tasks`;

const defaultEvents = [];
const defaultNotifications = [];
const defaultFocus = [];

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save', key, e);
  }
}

function getToken() {
  return localStorage.getItem('pm_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { user } = useAuth();

  const [tasks, setTasksState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState(() => loadJson(EVENTS_KEY, defaultEvents));
  const [notifications, setNotifications] = useState(() => loadJson(NOTIFICATIONS_KEY, defaultNotifications));
  const [todayFocus, setTodayFocus] = useState(() => loadJson(FOCUS_KEY, defaultFocus));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { saveJson(EVENTS_KEY, events); }, [events]);
  useEffect(() => { saveJson(NOTIFICATIONS_KEY, notifications); }, [notifications]);
  useEffect(() => { saveJson(FOCUS_KEY, todayFocus); }, [todayFocus]);

  useEffect(() => {
    if (!user) {
      setTasksState([]);
      return;
    }
    setLoading(true);
    fetch(API_URL, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasksState(data.map(normalizeTask));
        }
      })
      .catch((err) => console.error('Failed to load tasks', err))
      .finally(() => setLoading(false));
  }, [user]);

  function normalizeTask(t) {
    return {
      ...t,
      id: t._id || t.id,
      subtasks: (t.subtasks || []).map((s) => ({
        ...s,
        id: s._id || s.id,
      })),
    };
  }

  const addTask = useCallback(async (task) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(task),
      });
      const data = await res.json();
      if (res.ok) {
        setTasksState((prev) => [normalizeTask(data), ...prev]);
      }
    } catch (err) {
      console.error('addTask failed', err);
    }
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setTasksState((prev) => prev.map((t) => (t.id === id ? normalizeTask(data) : t)));
      }
    } catch (err) {
      console.error('updateTask failed', err);
    }
  }, []);

  const toggleTaskStatus = useCallback(async (id) => {
    setTasksState((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const nextStatus = task.status === 'done' ? 'todo' : 'done';
      updateTask(id, {
        status: nextStatus,
        completedAt: nextStatus === 'done' ? new Date().toISOString() : null,
      });
      return prev.map((t) =>
        t.id === id
          ? { ...t, status: nextStatus, completedAt: nextStatus === 'done' ? new Date().toISOString() : null }
          : t
      );
    });
  }, [updateTask]);

  const deleteTask = useCallback(async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      setTasksState((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('deleteTask failed', err);
    }
  }, []);

  const addSubtask = useCallback(async (taskId, title) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}/subtasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasksState((prev) => prev.map((t) => (t.id === taskId ? normalizeTask(data) : t)));
      }
    } catch (err) {
      console.error('addSubtask failed', err);
    }
  }, []);

  const toggleSubtaskStatus = useCallback(async (taskId, subtaskId) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setTasksState((prev) => prev.map((t) => (t.id === taskId ? normalizeTask(data) : t)));
      }
    } catch (err) {
      console.error('toggleSubtaskStatus failed', err);
    }
  }, []);

  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setTasksState((prev) => prev.map((t) => (t.id === taskId ? normalizeTask(data) : t)));
      }
    } catch (err) {
      console.error('deleteSubtask failed', err);
    }
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const projects = [...new Set(tasks.map((t) => t.project || 'Inbox').filter(Boolean))];

  const filteredTasks = searchQuery.trim()
    ? tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.project || '').toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : tasks;

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    addSubtask,
    toggleSubtaskStatus,
    deleteSubtask,
    events,
    setEvents,
    notifications,
    setNotifications,
    markNotificationsRead,
    unreadCount,
    todayFocus,
    setTodayFocus,
    searchQuery,
    setSearchQuery,
    filteredTasks,
    projects,
    user,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return ctx;
}

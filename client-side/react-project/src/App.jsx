import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';
import DashboardLayout from './components/pages/DashboardLayout';

import DashboardOverview from './components/pages/dashboard/DashboardOverview';
import DashboardTasks from './components/pages/dashboard/DashboardTasks';
import DashboardProjects from './components/pages/dashboard/DashboardProjects';
import DashboardCalendar from './components/pages/dashboard/DashboardCalendar';
import DashboardInbox from './components/pages/dashboard/DashboardInbox';
import DashboardSettings from './components/pages/dashboard/DashboardSettings';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-100">
          <Toaster position="top-right" />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute>
                  <TasksProvider>
                    <DashboardLayout />
                  </TasksProvider>
                </ProtectedRoute>
              )}
            >
              <Route index element={<DashboardOverview />} />
              <Route path="tasks" element={<DashboardTasks />} />
              <Route path="projects" element={<DashboardProjects />} />
              <Route path="calendar" element={<DashboardCalendar />} />
              <Route path="inbox" element={<DashboardInbox />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

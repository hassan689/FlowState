import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProgressDashboard from './pages/ProgressDashboard';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import FocusMode from './pages/FocusMode';
import DashboardHome from './pages/DashboardHome';
import Settings from './pages/Settings';
import VoiceAssistant from './pages/VoiceAssistant';
import Unstuck from './pages/Unstuck';
import Feedback from './pages/Feedback';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="progress" element={<ProgressDashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="create-task" element={<CreateTask />} />
          <Route path="edit-task/:taskId" element={<CreateTask />} />
          <Route path="focus" element={<FocusMode />} />
          <Route path="settings" element={<Settings />} />
          <Route path="voice-assistant" element={<VoiceAssistant />} />
          <Route path="unstuck" element={<Unstuck />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

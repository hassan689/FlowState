import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  PlusSquare,
  Target,
  TrendingUp,
  Settings,
  Mic,
  BrainCircuit,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/components/Sidebar.css';

export default function Sidebar({ pendingCount = 0, className = '' }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <CheckSquare size={20} />, label: 'Tasks', path: '/tasks' },
    { icon: <PlusSquare size={20} />, label: 'Create Task', path: '/create-task' },
    { icon: <Target size={20} />, label: 'Focus Mode', path: '/focus' },
    { icon: <TrendingUp size={20} />, label: 'Progress', path: '/progress' },
    { icon: <Settings size={20} />, label: 'Profile', path: '/settings' },
    { icon: <BrainCircuit size={20} />, label: 'Get Unstuck', path: '/unstuck' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', path: '/feedback' },
  ];

  return (
    <aside className={`sidebar sidebar-desktop ${className}`.trim()}>
      <div className="sidebar-header">
        <div className="logo-container">
          <BrainCircuit size={32} color="#4F8BFF" strokeWidth={2.5} />
          <div className="logo-text">
            <h2>AdaptiveFlow</h2>
            <p>Adaptive Task Manager</p>
          </div>
        </div>
      </div>
      <div className="sidebar-status">
        <div className="status-indicator">
          <span className="dot"></span>
          Signed in
        </div>
        <div className="status-subtext">{pendingCount} active tasks</div>
        {user && <div className="status-subtext sidebar-user-email">{user.email}</div>}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/voice-assistant"
          className={({ isActive }) => `voice-assistant-btn ${isActive ? 'active' : ''}`}
        >
          <Mic size={18} />
          Voice Assistant
        </NavLink>
        <button
          type="button"
          className="sidebar-logout"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}

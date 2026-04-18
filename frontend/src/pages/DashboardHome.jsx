import React from 'react';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/DashboardHome.css';

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="home-dashboard">
      <header className="home-header">
        <h1>Welcome Back! 👋</h1>
        <p>Here's what's happening with your tasks today.</p>
      </header>

      <div className="quick-stats-row">
        <div className="stat-card">
          <div className="icon-wrapper bg-blue"><CheckCircle2 size={24} color="#ffffff" /></div>
          <div className="stat-info">
            <h3>4</h3>
            <p>Tasks Due Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-purple"><Clock size={24} color="#ffffff" /></div>
          <div className="stat-info">
            <h3>2 hrs</h3>
            <p>Focus Time</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section card">
          <h2>Active Tasks</h2>
          <div className="active-tasks-list">
            <div className="task-item-home">
              <span className="priority-dot urgent"></span>
              <div className="task-details">
                <h4>Finish Frontend Build</h4>
                <p>Due in 2 hours</p>
              </div>
              <button className="btn-play" onClick={() => navigate('/focus')}><PlayCircle size={20} /></button>
            </div>
            <div className="task-item-home">
              <span className="priority-dot high"></span>
              <div className="task-details">
                <h4>Review API Integration</h4>
                <p>Due tomorrow</p>
              </div>
              <button className="btn-play" onClick={() => navigate('/focus')}><PlayCircle size={20} /></button>
            </div>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/tasks')}>View All Tasks</button>
        </section>

        <section className="dashboard-section card">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="action-btn" onClick={() => navigate('/create-task')}>
              + Create New Task
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/progress')}>
              View Progress
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/unstuck')}>
              Get Unstuck
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardHome;

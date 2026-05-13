import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { apiFetch } from '../api/client';
import '../styles/pages/DashboardHome.css';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [tRes, pRes] = await Promise.all([apiFetch('/api/tasks'), apiFetch('/api/adaptation/progress/summary')]);
      if (cancelled) return;
      if (tRes.ok) setTasks(await tRes.json());
      if (pRes.ok) setProgress(await pRes.json());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueToday = tasks.filter((t) => {
    if (!t.deadline || t.status === 'Done') return false;
    const d = new Date(t.deadline);
    return d >= startOfDay && d < new Date(startOfDay.getTime() + 86400000);
  }).length;

  const top = [...tasks].filter((t) => t.status !== 'Done').sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)).slice(0, 4);

  return (
    <div className="home-dashboard">
      <header className="home-header">
        <h1>Welcome back</h1>
        <p>Here is what your adaptive planner sees today.</p>
      </header>

      <div className="quick-stats-row">
        <div className="stat-card">
          <div className="icon-wrapper bg-blue">
            <CheckCircle2 size={24} color="#ffffff" />
          </div>
          <div className="stat-info">
            <h3>{dueToday}</h3>
            <p>Tasks due today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-purple">
            <Clock size={24} color="#ffffff" />
          </div>
          <div className="stat-info">
            <h3>{progress?.streak_days ?? 0}</h3>
            <p>Day streak</p>
          </div>
        </div>
      </div>

      <div className="progress-bar-wrap card adaptive-hide-hesitation">
        <p className="progress-bar-label">Completion (last 7 days)</p>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, Math.round((progress?.completion_rate_7d || 0) * 100))}%` }}
          />
        </div>
        <p className="subtle">{Math.round((progress?.completion_rate_7d || 0) * 100)}% weighted by your open workload</p>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section card">
          <h2>Active tasks</h2>
          <div className="active-tasks-list">
            {top.length === 0 && <p className="subtle">No pending tasks. Create one to get started.</p>}
            {top.map((t) => (
              <div key={t.id} className="task-item-home">
                <span className={`priority-dot ${t.priority}`} />
                <div className="task-details">
                  <h4>{t.title}</h4>
                  <p>{t.deadline ? `Due ${new Date(t.deadline).toLocaleString()}` : 'No deadline'}</p>
                </div>
                <button type="button" className="btn-play" onClick={() => navigate('/focus', { state: { task: t } })}>
                  <PlayCircle size={20} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-view-all" onClick={() => navigate('/tasks')}>
            View all tasks
          </button>
        </section>

        <section className="dashboard-section card">
          <h2>Quick actions</h2>
          <div className="quick-actions-grid">
            <button type="button" className="action-btn" onClick={() => navigate('/create-task')}>
              + Create new task
            </button>
            <button type="button" className="action-btn secondary" onClick={() => navigate('/progress')}>
              View progress
            </button>
            <button type="button" className="action-btn secondary" onClick={() => navigate('/unstuck')}>
              Get unstuck
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


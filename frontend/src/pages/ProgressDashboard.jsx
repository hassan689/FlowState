import React, { useEffect, useState } from 'react';
import { Trophy, Flame, CheckCircle, Award } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { apiFetch } from '../api/client';
import '../styles/pages/ProgressDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function ProgressDashboard() {
  const [summary, setSummary] = useState(null);
  const [tracker, setTracker] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sRes, tRes] = await Promise.all([
        apiFetch('/api/adaptation/progress/summary'),
        apiFetch('/api/adaptation/progress'),
      ]);
      if (cancelled) return;
      if (sRes.ok) setSummary(await sRes.json());
      if (tRes.ok) setTracker(await tRes.json());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const labels = summary?.daily_completed?.map((d) => d.date.slice(5)) ?? [];
  const completedSeries = summary?.daily_completed?.map((d) => d.completed_count) ?? [];

  const activityData = {
    labels,
    datasets: [
      {
        label: 'Tasks completed',
        data: completedSeries,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.35)',
        tension: 0.35,
      },
    ],
  };

  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Completed (approx.)',
        data: [0, 0, 0],
        backgroundColor: '#10B981',
      },
    ],
  };

  const priorityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const ratePct = Math.round((summary?.completion_rate_7d || 0) * 100);
  const streak = summary?.streak_days ?? tracker?.streak_days ?? 0;
  const doneAll = summary?.tasks_completed_all ?? tracker?.tasks_completed ?? 0;

  return (
    <div className="progress-dashboard">
      <header className="dashboard-header">
        <div className="header-title">
          <TrendingUpIcon />
          <h1>Your progress</h1>
        </div>
        <p>Seven-day completion trend and streak from Flowstate analytics</p>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#F59E0B' }}>
            <Trophy size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">{ratePct}%</h2>
            <p className="kpi-label">Completion (7d / open workload)</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#EF4444' }}>
            <Flame size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">{streak} days</h2>
            <p className="kpi-label">Current streak</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#10B981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">{doneAll}</h2>
            <p className="kpi-label">Tasks completed (all time)</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#A855F7' }}>
            <Award size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">{summary?.total_tasks ?? 0}</h2>
            <p className="kpi-label">Total tasks tracked</p>
          </div>
        </div>
      </section>

      <section className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">
            <CalendarIcon /> Last 7 days — completions per day
          </h3>
          <div className="chart-container" style={{ height: '250px' }}>
            {labels.length ? <Line data={activityData} options={activityOptions} /> : <div className="empty-state">No data yet</div>}
          </div>
        </div>
      </section>

      <section className="chart-full-width">
        <div className="chart-card">
          <h3 className="chart-title">
            <ZapIcon /> Placeholder distribution
          </h3>
          <div className="chart-container" style={{ height: '220px' }}>
            <Bar data={priorityData} options={priorityOptions} />
          </div>
        </div>
      </section>
    </div>
  );
}

const TrendingUpIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

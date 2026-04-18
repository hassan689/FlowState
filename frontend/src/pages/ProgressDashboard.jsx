import React from 'react';
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
import '../styles/pages/ProgressDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProgressDashboard = () => {
  // Mock data for Last 7 Days Activity (Line Chart)
  const activityData = {
    labels: ['Mar 19', 'Mar 20', 'Mar 21', 'Mar 22', 'Mar 23', 'Mar 24', 'Mar 25'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [0, 0, 0, 0, 0, 0, 0], // Empty state as per image
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        ticks: { stepSize: 1 }
      }
    }
  };

  // Mock data for Completion by Priority (Bar Chart)
  const priorityData = {
    labels: ['Urgent', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Completed',
        data: [0, 0, 0, 0],
        backgroundColor: '#10B981', // Green
      },
      {
        label: 'Total',
        data: [0, 0, 0, 0],
        backgroundColor: '#94A3B8', // Gray
      },
    ],
  };

  const priorityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div className="progress-dashboard">
      <header className="dashboard-header">
        <div className="header-title">
          <TrendingUpIcon />
          <h1>Your Progress</h1>
        </div>
        <p>Track your productivity and celebrate your achievements</p>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#F59E0B' }}>
            <Trophy size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">0%</h2>
            <p className="kpi-label">Completion Rate</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#EF4444' }}>
            <Flame size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">0 Days</h2>
            <p className="kpi-label">Current Streak</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#10B981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">0</h2>
            <p className="kpi-label">Tasks Completed</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: '#A855F7' }}>
            <Award size={24} />
          </div>
          <div className="kpi-info">
            <h2 className="kpi-value">0/6</h2>
            <p className="kpi-label">Achievements</p>
          </div>
        </div>
      </section>

      <section className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title"><CalendarIcon /> Last 7 Days Activity</h3>
          <div className="chart-container" style={{ height: '250px' }}>
            <Line data={activityData} options={activityOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3 className="chart-title"><PieChartIcon /> Task Distribution</h3>
          <div className="empty-state">No task data available</div>
        </div>
      </section>

      <section className="chart-full-width">
        <div className="chart-card">
          <h3 className="chart-title"><ZapIcon /> Completion by Priority</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={priorityData} options={priorityOptions} />
          </div>
        </div>
      </section>

      <section className="achievements-section card">
        <div className="achievements-header">
          <Trophy size={20} color="#F59E0B" />
          <h3>Achievements</h3>
        </div>
        <div className="achievements-grid">
          <AchievementCard icon={<CheckCircle/>} title="First Steps" desc="Complete your first task" />
          <AchievementCard icon={<Award/>} title="Productive" desc="Complete 5 tasks" />
          <AchievementCard icon={<Flame/>} title="Consistent" desc="3-day streak" />
          <AchievementCard icon={<Trophy/>} title="Dedicated" desc="7-day streak" />
          <AchievementCard icon={<CheckCircle/>} title="Urgent Master" desc="Complete 3 urgent tasks" />
          <AchievementCard icon={<Award/>} title="Perfectionist" desc="Achieve 90% completion rate" />
        </div>
      </section>

      <section className="cta-section block">
        <div className="cta-icon-wrapper">
          <div className="cta-icon">⭐</div>
        </div>
        <h2>Let's Get Started!</h2>
        <p>Complete your first task to start building your productivity streak.</p>
      </section>
    </div>
  );
};

const AchievementCard = ({ icon, title, desc }) => (
  <div className="achievement-item">
    <div className="ach-icon">{icon}</div>
    <div className="ach-text">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

const TrendingUpIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const PieChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
);

const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

export default ProgressDashboard;

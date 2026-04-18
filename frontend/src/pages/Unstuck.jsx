import React from 'react';
import { Brain, AlertCircle, BarChart2, Zap, AlertOctagon, ListTodo, Target, Coffee, Lightbulb, Activity, CheckSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Unstuck.css';

const Unstuck = () => {
  const navigate = useNavigate();

  return (
    <div className="unstuck-page">
      <header className="unstuck-header">
        <div className="header-icon-wrapper orange-bg">
          <Brain size={32} color="#ffffff" strokeWidth={2} />
        </div>
        <h1>Let's Get You Unstuck</h1>
        <p>We've noticed some hesitation in your workflow. That's completely normal!<br/>Here are some proven strategies to help you move forward.</p>
        
        <div className="hesitation-alert">
          <AlertCircle size={16} />
          Minor hesitation noticed. A small nudge should help.
        </div>
      </header>

      <div className="unstuck-content">
        <section className="snapshot-card card">
          <div className="snapshot-header">
            <BarChart2 size={18} color="#6D28D9" />
            <h3>Your Behavior Snapshot</h3>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-item">
              <h2 className="text-orange">0</h2>
              <p>Hesitation Events</p>
              <div className="metric-bar"></div>
            </div>
            <div className="metric-item">
              <h2 className="text-blue">0</h2>
              <p>Tasks Opened</p>
              <div className="metric-bar"></div>
            </div>
            <div className="metric-item">
              <h2 className="text-green">0%</h2>
              <p>Completion Rate</p>
              <div className="metric-bar"></div>
            </div>
            <div className="metric-item">
              <h2 className="text-purple">0</h2>
              <p>Active Tasks</p>
              <div className="metric-bar"></div>
            </div>
          </div>
        </section>

        <section className="strategies-section">
          <h2 className="section-title">Choose Your Strategy</h2>
          
          <div className="strategies-grid">
            {/* Quick Win - Disabled */}
            <div className="strategy-card disabled bg-green-light">
              <div className="strategy-icon bg-green">
                <Zap size={24} color="#ffffff" />
              </div>
              <h3>Quick Win Strategy</h3>
              <p className="subtitle text-green">Start small, build momentum</p>
              <p className="desc">Begin with a simple 5-15 minute task to build confidence and get into flow.</p>
              <p className="status text-muted">Not available right now</p>
            </div>

            {/* Urgent First - Disabled */}
            <div className="strategy-card disabled bg-red-light">
              <div className="strategy-icon bg-red">
                <AlertOctagon size={24} color="#ffffff" />
              </div>
              <h3>Urgent First</h3>
              <p className="subtitle text-red">Tackle high-priority items</p>
              <p className="desc">Address time-sensitive tasks that need immediate attention.</p>
              <p className="status text-muted">Not available right now</p>
            </div>

            {/* Task Breakdown - Active */}
            <div className="strategy-card active bg-blue-light border-blue">
              <div className="strategy-icon bg-blue">
                <ListTodo size={24} color="#ffffff" />
              </div>
              <h3>Task Breakdown</h3>
              <p className="subtitle text-blue">Simplify complex work</p>
              <p className="desc">Break overwhelming tasks into smaller, manageable subtasks.</p>
              <button className="btn-select text-blue">Select this strategy &rarr;</button>
            </div>

            {/* Focus Mode - Disabled */}
            <div className="strategy-card disabled bg-purple-light">
              <div className="strategy-icon bg-purple">
                <Target size={24} color="#ffffff" />
              </div>
              <h3>Focus Mode</h3>
              <p className="subtitle text-purple">Eliminate distractions</p>
              <p className="desc">Enter a distraction-free environment with Pomodoro timer.</p>
              <p className="status text-muted">Not available right now</p>
            </div>

            {/* Take a Break - Active */}
            <div className="strategy-card active bg-orange-light border-orange">
              <div className="strategy-icon bg-orange">
                <Coffee size={24} color="#ffffff" />
              </div>
              <h3>Take a Break</h3>
              <p className="subtitle text-orange">Recharge your mind</p>
              <p className="desc">Sometimes stepping away helps. Return when you're refreshed.</p>
              <button className="btn-select text-orange">Select this strategy &rarr;</button>
            </div>
          </div>
        </section>

        <section className="tips-section">
          <div className="tips-header">
            <Lightbulb size={18} className="text-orange" />
            <h3 className="text-orange">Science-Backed Tips to Overcome Decision Paralysis</h3>
          </div>
          
          <div className="tips-grid">
            <div className="tip-item">
              <div className="tip-icon bg-orange-soft">
                <Activity size={16} className="text-orange-dark" />
              </div>
              <div className="tip-content">
                <h4>Two-Minute Rule</h4>
                <p className="text-orange-dark">If a task takes less than 2 minutes, do it immediately. This reduces mental clutter.</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon bg-orange-soft">
                <Brain size={16} className="text-orange-dark" />
              </div>
              <div className="tip-content">
                <h4>Reduce Choices</h4>
                <p className="text-orange-dark">Too many options cause decision fatigue. Focus on just 1-3 tasks at a time.</p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-icon bg-orange-soft">
                <CheckSquare size={16} className="text-orange-dark" />
              </div>
              <div className="tip-content">
                <h4>Start Imperfectly</h4>
                <p className="text-orange-dark">Done is better than perfect. Just start, you can refine as you go.</p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-icon bg-orange-soft">
                <Clock size={16} className="text-orange-dark" />
              </div>
              <div className="tip-content">
                <h4>Time Boxing</h4>
                <p className="text-orange-dark">Set a timer for 25 minutes (Pomodoro). Commit to working until it rings.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-actions-unstuck">
          <button className="btn-outline-unstuck">
            <CheckSquare size={18} />
            I'm Ready - Clear This Alert
          </button>
          <button className="btn-dark-unstuck" onClick={() => navigate('/focus')}>
            <Target size={18} />
            Start Focus Mode Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unstuck;

import React from 'react';
import { Target, Clock, Play, CheckCircle2 } from 'lucide-react';
import '../styles/pages/FocusMode.css';

const FocusMode = () => {
  return (
    <div className="focus-mode-page">
      <header className="focus-header">
        <div className="icon-wrapper">
          <Target size={24} color="#ffffff" className="focus-icon" />
        </div>
        <h1>Focus Mode</h1>
        <p>Eliminate distractions and get in the zone</p>
      </header>

      <div className="focus-content">
        <div className="timer-card card">
          <div className="timer-progress-bar"></div>
          <div className="timer-display">
            <h1 className="time-text">25:00</h1>
            <div className="timer-status">
              <Clock size={16} />
              <span>Ready to start</span>
            </div>
            <button className="btn-start-focus">
              <Play size={16} fill="currentColor" />
              Start Focus
            </button>
          </div>
        </div>

        <div className="tasks-completed-card card">
          <div className="completed-icon-wrapper">
            <CheckCircle2 size={48} strokeWidth={2.5} color="#10B981" />
          </div>
          <h2>All tasks completed!</h2>
          <p>Great work! Take a break or create new tasks.</p>
        </div>

        <div className="focus-tips-card">
          <h2>Focus Tips</h2>
          <ul className="tips-list">
            <li>Eliminate all distractions - close unnecessary tabs and apps</li>
            <li>Take short breaks between focus sessions</li>
            <li>Use fullscreen mode for maximum concentration</li>
            <li>Start with your highest priority tasks first</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Clock, Play, Square, ArrowLeft } from 'lucide-react';
import '../styles/pages/FocusMode.css';

const POMO_DEFAULT = 25 * 60;

function formatMmSs(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task || null;
  const [secondsLeft, setSecondsLeft] = useState(POMO_DEFAULT);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (task?.id) {
      localStorage.setItem('flowstate_last_task_id', task.id);
    }
  }, [task]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return POMO_DEFAULT;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const label = useMemo(() => formatMmSs(secondsLeft), [secondsLeft]);

  return (
    <div className="focus-mode-page focus-minimal">
      <button type="button" className="focus-exit adaptive-hide-on-distraction" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={18} /> Exit focus
      </button>

      <header className="focus-header">
        <div className="icon-wrapper">
          <Target size={24} color="#ffffff" className="focus-icon" />
        </div>
        <h1>Focus mode</h1>
        <p>One task, one timer, minimal distractions.</p>
      </header>

      <div className="focus-content">
        <div className="timer-card card">
          <div className="timer-display">
            <h1 className="time-text">{label}</h1>
            <div className="timer-status">
              <Clock size={16} />
              <span>{running ? 'Focusing' : 'Ready'}</span>
            </div>
            <div className="focus-actions-row">
              <button type="button" className="btn-start-focus" onClick={() => setRunning((r) => !r)}>
                <Play size={16} fill="currentColor" />
                {running ? 'Pause' : 'Start'}
              </button>
              <button type="button" className="btn-reset-focus" onClick={() => { setRunning(false); setSecondsLeft(POMO_DEFAULT); }}>
                <Square size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {task ? (
          <div className="focus-task-card card">
            <h2>Current task</h2>
            <p className="focus-task-title">{task.title}</p>
            <p className="focus-task-meta">
              {task.priority} priority · {task.category}
              {task.deadline && <> · due {new Date(task.deadline).toLocaleString()}</>}
            </p>
          </div>
        ) : (
          <div className="tasks-completed-card card">
            <h2>No task selected</h2>
            <p>Pick a recommendation from the dashboard or open a task from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Calendar, Plus } from 'lucide-react';
import { apiFetch } from '../api/client';
import '../styles/pages/CreateTask.css';

const CATEGORIES = ['Assignment', 'Exam', 'Project', 'Reading', 'Other'];

export default function CreateTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(taskId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Assignment');
  const [priority, setPriority] = useState('medium');
  const [due, setDue] = useState('');
  const [estimate, setEstimate] = useState(30);
  const [status, setStatus] = useState('To Do');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    (async () => {
      const res = await apiFetch(`/api/tasks/${taskId}`);
      if (!res.ok || cancelled) return;
      const t = await res.json();
      setTitle(t.title);
      setDescription(t.description || '');
      setCategory(t.category);
      setPriority((t.priority || 'medium').toLowerCase());
      setDue(t.deadline ? t.deadline.slice(0, 16) : '');
      setEstimate(t.time_estimate_minutes ?? 30);
      setStatus(t.status);
    })();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        title,
        description: description || null,
        category,
        priority,
        time_estimate_minutes: Number(estimate) || 30,
        estimated_effort: Math.max(0, Math.round(Number(estimate) / 60)),
        deadline: due ? new Date(due).toISOString() : null,
        tags: [],
      };
      if (isEdit) {
        const res = await apiFetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          body: {
            ...body,
            status,
          },
        });
        if (!res.ok) throw new Error('Could not update task');
      } else {
        const res = await apiFetch('/api/tasks', { method: 'POST', body });
        if (!res.ok) throw new Error('Could not create task');
      }
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-page">
      <header className="page-header">
        <h1>{isEdit ? 'Edit Task' : 'Create New Task'}</h1>
        <p>Add details so your adaptive planner can prioritize effectively.</p>
      </header>

      {error && <p className="create-task-error">{error}</p>}

      <div className="content-grid">
        <div className="form-card card">
          <div className="card-header">
            <Sparkles size={20} className="header-icon" color="#2563EB" />
            <h2>Task Details</h2>
          </div>

          <form className="task-form" onSubmit={submit}>
            <div className="form-group">
              <label>
                Task Title <span className="required">*</span>
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What needs to be done?" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Priority</label>
                <div className="select-wrapper">
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group half-width">
                <label>Time estimate (minutes)</label>
                <input type="number" min={5} value={estimate} onChange={(e) => setEstimate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due date</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
            </div>

            {isEdit && (
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-dark full-width" disabled={loading}>
                <Plus size={18} />
                {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create Task'}
              </button>
              <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="tips-card">
          <div className="card-header">
            <Sparkles size={20} className="header-icon" color="#2563EB" />
            <h2>Adaptive tips</h2>
          </div>
          <ul className="tips-list">
            <li>High priority with deadlines boosts recommendations when you are overloaded.</li>
            <li>Smaller time estimates are suggested when the app senses hesitation.</li>
            <li>Use Focus mode for a single-task Pomodoro view.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


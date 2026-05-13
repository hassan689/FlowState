import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { apiFetch } from '../api/client';
import '../styles/pages/Tasks.css';

const STATUSES = ['', 'To Do', 'In Progress', 'Done'];
const PRIOS = ['', 'low', 'medium', 'high'];
const CATEGORIES = ['', 'Assignment', 'Exam', 'Project', 'Reading', 'Other'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setError('');
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (category) params.set('category', category);
    const q = params.toString();
    const res = await apiFetch(`/api/tasks${q ? `?${q}` : ''}`);
    if (!res.ok) {
      setError('Could not load tasks.');
      return;
    }
    setTasks(await res.json());
  }, [status, priority, category]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    const res = await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const sorted = [...tasks].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div className="header-left">
          <h1>Tasks</h1>
          <p>{tasks.length} task{tasks.length === 1 ? '' : 's'}</p>
        </div>
        <button type="button" className="btn-dark" onClick={() => navigate('/create-task')}>
          <Plus size={18} />
          Add Task
        </button>
      </header>

      {error && <p className="tasks-error">{error}</p>}

      <section className={`filter-bar adaptive-hide-hesitation ${tasks.length ? '' : 'filter-bar-empty'}`}>
        <div className="filter-dropdowns">
          <label className="filter-label">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="filter-select">
              {STATUSES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s || 'All statuses'}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-label">
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="filter-select">
              {PRIOS.map((p) => (
                <option key={p || 'all'} value={p}>
                  {p ? p[0].toUpperCase() + p.slice(1) : 'All priorities'}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-label">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
              {CATEGORIES.map((c) => (
                <option key={c || 'all'} value={c}>
                  {c || 'All categories'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {sorted.length === 0 ? (
        <section className="empty-state-section">
          <div className="empty-state-content">
            <h2>No tasks match</h2>
            <p>Create a task or adjust filters.</p>
            <button type="button" className="btn-dark mt-4" onClick={() => navigate('/create-task')}>
              <Plus size={18} />
              Create Task
            </button>
          </div>
        </section>
      ) : (
        <section className="tasks-grid">
          {sorted.map((t) => (
            <article key={t.id} className="task-card card">
              <div className="task-card-top">
                <span className={`prio-badge prio-${(t.priority || 'medium').toLowerCase()}`}>{t.priority}</span>
                <span className="task-cat">{t.category}</span>
              </div>
              <h3>{t.title}</h3>
              {t.description && <p className="task-desc">{t.description}</p>}
              <div className="task-meta">
                {t.deadline && <span>Due {new Date(t.deadline).toLocaleString()}</span>}
                <span>{t.status}</span>
                <span>~{t.time_estimate_minutes} min</span>
              </div>
              <div className="task-actions adaptive-hide-hesitation">
                <button type="button" className="btn-outline btn-sm" onClick={() => navigate(`/edit-task/${t.id}`)}>
                  <Pencil size={16} /> Edit
                </button>
                <button type="button" className="btn-danger btn-sm" onClick={() => onDelete(t.id)}>
                  <Trash2 size={16} /> Delete
                </button>
                <Link to="/focus" state={{ task: t }} className="btn-primary btn btn-sm">
                  Focus
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import '../styles/pages/Settings.css';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('light');
  const [focusDefault, setFocusDefault] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    const p = user.study_preferences || {};
    setTheme(p.theme || 'light');
    setFocusDefault(Boolean(p.focus_mode_default));
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const study_preferences = {
        ...(user?.study_preferences || {}),
        theme,
        focus_mode_default: focusDefault,
      };
      const res = await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: { name, study_preferences },
      });
      if (!res.ok) throw new Error('Could not save profile');
      await refreshUser();
      document.documentElement.dataset.theme = theme;
      setMsg('Saved.');
    } catch (err) {
      setMsg(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header settings-header">
        <div className="header-icon-wrapper blue-bg">
          <SettingsIcon size={24} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <h1>Profile & preferences</h1>
          <p>These values drive the adaptive UI and defaults across devices.</p>
        </div>
      </header>

      {msg && <p className="settings-banner">{msg}</p>}

      <form className="settings-content" onSubmit={saveProfile}>
        <section className="settings-section card">
          <div className="section-header">
            <User size={18} className="section-icon" />
            <div className="section-title-wrapper">
              <h2>Account</h2>
              <p>Name and email from your Flowstate profile</p>
            </div>
          </div>
          <div className="settings-list">
            <div className="setting-item column">
              <label className="setting-label">Display name</label>
              <input className="setting-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="setting-item column">
              <label className="setting-label">Email</label>
              <input className="setting-input" value={user?.email || ''} disabled />
            </div>
          </div>
        </section>

        <section className="settings-section card">
          <div className="section-header">
            <Palette size={18} className="section-icon" />
            <div className="section-title-wrapper">
              <h2>Study preferences</h2>
              <p>Stored as JSON on the server (`study_preferences`)</p>
            </div>
          </div>
          <div className="settings-list">
            <div className="setting-item column">
              <label className="setting-label">Theme</label>
              <select className="setting-input" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label>Default focus mode entry</label>
                <p>When enabled, the planner opens with fewer secondary controls.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={focusDefault} onChange={(e) => setFocusDefault(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section card">
          <div className="section-header">
            <Zap size={18} className="section-icon pink-icon" />
            <div className="section-title-wrapper">
              <h2>Accessibility</h2>
              <p>Visual toggles (local-first patterns can extend these fields)</p>
            </div>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <label>Reduced motion</label>
                <p>Minimize transitions for sensitive sessions</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" readOnly />
                <span className="slider" />
              </label>
            </div>
          </div>
        </section>

        <button type="submit" className="btn-primary btn settings-save" disabled={loading}>
          {loading ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}

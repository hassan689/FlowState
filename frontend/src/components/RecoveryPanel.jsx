import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';

export default function RecoveryPanel() {
  const [payload, setPayload] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const res = await apiFetch('/api/adaptation/recovery-suggestions');
    if (!res.ok) return;
    setPayload(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load]);

  if (!payload?.show_recovery) return null;

  const t = payload.suggested_task;

  return (
    <div className="recovery-panel card">
      <h3>Welcome back</h3>
      <p className="subtle">You were away for about {payload.minutes_inactive} minutes.</p>
      <p>{payload.message}</p>
      {t && (
        <div className="recovery-task">
          <strong>{t.title}</strong>
          <div className="recovery-actions">
            <button type="button" className="btn-primary btn" onClick={() => navigate('/focus', { state: { task: t } })}>
              Resume focus
            </button>
            <button
              type="button"
              className="btn-secondary btn"
              onClick={() => setPayload({ ...payload, show_recovery: false })}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

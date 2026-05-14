import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageOutlet from '../components/PageOutlet';
import BottomNav from '../components/BottomNav';
import RecommendationBanner from '../components/RecommendationBanner';
import RecoveryPanel from '../components/RecoveryPanel';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { apiFetch } from '../api/client';

const LAST_FOCUS_KEY = 'flowstate_last_task_id';

export default function DashboardLayout() {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastTaskId, setLastTaskId] = useState(() => localStorage.getItem(LAST_FOCUS_KEY) || null);
  const behavior = useBehaviorTracker(pendingCount);
  const navigate = useNavigate();
  const location = useLocation();
  const isFocusRoute = location.pathname.includes('/focus');

  const uiAdaptive = useMemo(() => (behavior === 'neutral' ? 'focus' : behavior), [behavior]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch('/api/tasks');
      if (!res.ok || cancelled) return;
      const list = await res.json();
      const pending = list.filter((t) => t.status !== 'Done').length;
      setPendingCount(pending);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onStorage = () => setLastTaskId(localStorage.getItem(LAST_FOCUS_KEY));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className={`app-container${isFocusRoute ? ' focus-route' : ''}`} data-adaptive={uiAdaptive}>
      <div className="adaptive-distraction-reminder">
        You switched away — stay with one task at a time when you can.
      </div>
      <Sidebar pendingCount={pendingCount} className="adaptive-hide-on-distraction" />
      <main className="main-content">
        <div className="adaptive-overload-banner adaptive-hide-on-distraction">
          Many open tasks — finish high-impact items first. Priorities are highlighted below.
        </div>
        <div className="adaptive-hide-on-distraction">
          <RecoveryPanel />
        </div>
        <RecommendationBanner
          interactionState={behavior === 'neutral' ? 'focus' : behavior}
          lastTaskId={lastTaskId}
          pendingCount={pendingCount}
          onFocusTask={(task) => {
            localStorage.setItem(LAST_FOCUS_KEY, task.id);
            setLastTaskId(task.id);
            navigate('/focus', { state: { task } });
          }}
        />
        <PageOutlet />
      </main>
      <BottomNav />
    </div>
  );
}

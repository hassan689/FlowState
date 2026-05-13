import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api/client';

const SESSION_KEY = 'flowstate_behavior_session';

function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useBehaviorTracker(pendingTaskCount = 0) {
  const [state, setState] = useState('neutral');
  const lastSent = useRef('');
  const idleTimer = useRef(null);
  const lastInput = useRef(Date.now());

  const touch = useCallback(() => {
    lastInput.current = Date.now();
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!document.hidden && pendingTaskCount <= 10) {
        setState('hesitation');
      }
    }, 5000);
  }, [pendingTaskCount]);

  useEffect(() => {
    touch();
    const onVis = () => {
      if (document.hidden) {
        setState('distraction');
      } else {
        setState('neutral');
        touch();
      }
    };
    const onInput = () => {
      setState((prev) => (prev === 'distraction' ? prev : 'neutral'));
      touch();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('keydown', onInput);
    window.addEventListener('pointerdown', onInput);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('pointerdown', onInput);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [touch]);

  useEffect(() => {
    if (document.hidden) return;
    if (pendingTaskCount > 10) setState('overload');
    else setState((s) => (s === 'overload' ? 'neutral' : s));
  }, [pendingTaskCount]);

  useEffect(() => {
    if (state === lastSent.current) return;
    lastSent.current = state;
    const session_id = getOrCreateSessionId();
    apiFetch('/api/interactions/state', {
      method: 'POST',
      body: {
        session_id,
        state,
        pending_task_count: pendingTaskCount,
        metadata: { source: 'useBehaviorTracker' },
      },
    }).catch(() => {});
  }, [state, pendingTaskCount]);

  return state;
}

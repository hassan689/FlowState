import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function RecommendationBanner({ interactionState, lastTaskId, pendingCount, onFocusTask }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch('/api/adaptation/recommendations', {
        method: 'POST',
        body: {
          interaction_state: interactionState,
          last_task_id: lastTaskId || null,
          pending_task_count: pendingCount,
        },
      });
      if (!res.ok || cancelled) return;
      setData(await res.json());
    })();
    return () => {
      cancelled = true;
    };
  }, [interactionState, lastTaskId, pendingCount]);

  if (!data?.task) return null;

  return (
    <div className="recommendation-banner card adaptive-hide-hesitation adaptive-hide-on-distraction">
      <div>
        <strong>Suggested next step</strong>
        <p className="rec-title">{data.task.title}</p>
        <p className="rec-reason subtle">{data.reason.replace(/_/g, ' ')}</p>
      </div>
      {onFocusTask && (
        <button type="button" className="btn-primary btn" onClick={() => onFocusTask(data.task)}>
          Focus on this
        </button>
      )}
    </div>
  );
}

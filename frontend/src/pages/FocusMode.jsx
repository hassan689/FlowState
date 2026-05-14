import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Clock, Play, Square, ArrowLeft, Video, Shield, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../api/client';
import { useVisionAttention } from '../hooks/useVisionAttention';
import { useVisionBlinkTiming } from '../hooks/useVisionBlinkTiming';
import { useVisionSoundAlerts } from '../hooks/useVisionSoundAlerts';
import { resumeVisionAlertAudio } from '../lib/visionAlertAudio';
import {
  BLINK_REMINDER_MESSAGES,
  BLINK_THANKS_MESSAGES,
  FATIGUE_MESSAGES,
  GAZE_AWAY_MESSAGES,
  NO_FACE_MESSAGES,
  pickRotatingMessage,
} from '../lib/visionEngagementMessages';
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
  const task = location.state?.task ?? null;
  const [completeSaving, setCompleteSaving] = useState(false);
  const [completeError, setCompleteError] = useState('');

  const [secondsLeft, setSecondsLeft] = useState(POMO_DEFAULT);
  const [running, setRunning] = useState(false);
  const [visionConsent, setVisionConsent] = useState(false);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const overlayCanvasRef = useRef(null);

  const { status, lastSnapshot, errorMessage, videoRef } = useVisionAttention({
    enabled: visionConsent,
    running,
    sendIntervalMs: 4000,
    taskId: task?.id,
    overlayCanvasRef,
  });

  const visionActive = Boolean(running && visionConsent && status === 'active');
  const { lastBlinkAtMs, blinkNonce } = useVisionBlinkTiming(lastSnapshot, visionActive);

  useVisionSoundAlerts({
    active: visionActive,
    soundEnabled: soundAlertsEnabled,
    snapshot: lastSnapshot,
    lastBlinkAtMs,
    blinkNonce,
  });

  const [serverNow, setServerNow] = useState(() => Date.now());
  useEffect(() => {
    if (!visionActive) return undefined;
    const id = window.setInterval(() => {
      setServerNow(Date.now());
    }, 2000);
    return () => window.clearInterval(id);
  }, [visionActive]);

  const [blinkPraise, setBlinkPraise] = useState(null);
  const lastPraiseUiAtRef = useRef(0);

  useEffect(() => {
    if (!visionActive || blinkNonce === 0) return;
    const now = Date.now();
    if (now - lastPraiseUiAtRef.current < 11000) return;
    lastPraiseUiAtRef.current = now;
    setBlinkPraise(pickRotatingMessage(BLINK_THANKS_MESSAGES, blinkNonce));
    const t = window.setTimeout(() => setBlinkPraise(null), 2600);
    return () => window.clearTimeout(t);
  }, [blinkNonce, visionActive]);

  const visionAlert = useMemo(() => {
    if (!visionActive || !lastSnapshot) return null;
    const salt = Math.floor(serverNow / 12000);

    if (!lastSnapshot.face_present) {
      return {
        level: 'danger',
        kind: 'no_face',
        text: pickRotatingMessage(NO_FACE_MESSAGES, salt),
      };
    }

    const gaze = lastSnapshot.gaze_bucket;
    if (gaze === 'left' || gaze === 'right') {
      return {
        level: 'warn',
        kind: 'gaze',
        text: pickRotatingMessage(GAZE_AWAY_MESSAGES, salt),
      };
    }

    const f = typeof lastSnapshot.fatigue_proxy === 'number' ? lastSnapshot.fatigue_proxy : 0;
    if (f > 0.68) {
      return {
        level: 'warn',
        kind: 'fatigue',
        text: pickRotatingMessage(FATIGUE_MESSAGES, salt),
      };
    }

    const bl = lastSnapshot.blink_left;
    const br = lastSnapshot.blink_right;
    const dryMs = serverNow - lastBlinkAtMs;
    if (lastBlinkAtMs > 0 && bl != null && br != null && dryMs > 26000) {
      return {
        level: 'engage',
        kind: 'blink_dry',
        text: pickRotatingMessage(BLINK_REMINDER_MESSAGES, salt),
      };
    }

    return null;
  }, [visionActive, lastSnapshot, lastBlinkAtMs, serverNow]);

  const onToggleRunning = useCallback(() => {
    setRunning((r) => {
      const next = !r;
      if (next) {
        void resumeVisionAlertAudio();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (task?.id && task.status !== 'Done') {
      localStorage.setItem('flowstate_last_task_id', task.id);
    }
  }, [task]);

  const onMarkTaskComplete = useCallback(async () => {
    if (!task?.id || task.status === 'Done' || completeSaving) return;
    setCompleteError('');
    setCompleteSaving(true);
    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: { status: 'Done' },
      });
      if (!res.ok) {
        const t = await res.text();
        setCompleteError(t || 'Could not update task.');
        return;
      }
      const updated = await res.json();
      setRunning(false);
      localStorage.removeItem('flowstate_last_task_id');
      navigate('/focus', { replace: true, state: { task: updated } });
    } catch (e) {
      setCompleteError(e?.message || 'Network error.');
    } finally {
      setCompleteSaving(false);
    }
  }, [task, completeSaving, navigate]);

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

  const visionStatusClass =
    status === 'loading' ? 'loading' : status === 'active' ? 'active' : status === 'error' ? 'error' : '';

  return (
    <div className="focus-mode-page focus-minimal">
      <div className="focus-top-bar adaptive-hide-on-distraction">
        <button type="button" className="focus-exit" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Exit focus
        </button>
        <div className="focus-title-right">
          <div className="focus-title-right-icon" aria-hidden>
            <Target size={22} color="#ffffff" />
          </div>
          <div className="focus-title-right-text">
            <h1 className="focus-title-heading">Focus mode</h1>
            <p className="focus-title-tagline">One task, one timer, minimal distractions.</p>
          </div>
        </div>
      </div>

      <div className="focus-content">
        <div className="focus-two-pillars">
          <section
            className="focus-pillar-card focus-session-card card"
            aria-labelledby="focus-session-card-title"
          >
            <h2 id="focus-session-card-title" className="focus-card-title">
              <Clock size={20} aria-hidden />
              Session timer
            </h2>
            <p className="focus-card-subtitle">Pomodoro countdown and controls for this focus block.</p>

            <div className="focus-timer-panel">
              <div className="timer-display focus-timer-display">
                <p className="time-text" aria-live="polite">
                  {label}
                </p>
                <div className="timer-status">
                  <Clock size={16} />
                  <span>{running ? 'Focusing' : 'Ready'}</span>
                </div>
                <div className="focus-actions-row">
                  <button type="button" className="btn-start-focus" onClick={onToggleRunning}>
                    <Play size={16} fill="currentColor" />
                    {running ? 'Pause' : 'Start'}
                  </button>
                  <button
                    type="button"
                    className="btn-reset-focus"
                    onClick={() => {
                      setRunning(false);
                      setSecondsLeft(POMO_DEFAULT);
                    }}
                  >
                    <Square size={16} />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="focus-session-task-block">
              {task ? (
                <>
                  <h3 className="focus-session-task-heading">Current task</h3>
                  <p className="focus-task-title">{task.title}</p>
                  <p className="focus-task-meta">
                    {task.priority} priority · {task.category}
                    {task.deadline && <> · due {new Date(task.deadline).toLocaleString()}</>}
                  </p>
                  {task.status === 'Done' ? (
                    <p className="focus-task-complete-banner" role="status">
                      <CheckCircle2 size={18} aria-hidden />
                      This task is marked complete. Great job.
                    </p>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-task-complete-focus"
                        disabled={completeSaving}
                        onClick={onMarkTaskComplete}
                      >
                        <CheckCircle2 size={18} aria-hidden />
                        {completeSaving ? 'Saving…' : 'Mark task complete'}
                      </button>
                      {completeError && <p className="focus-task-complete-error">{completeError}</p>}
                    </>
                  )}
                </>
              ) : (
                <>
                  <h3 className="focus-session-task-heading">No task selected</h3>
                  <p className="focus-task-meta">
                    Pick a recommendation from the dashboard or open a task from the list.
                  </p>
                </>
              )}
            </div>
          </section>

          <section
            className="focus-pillar-card focus-vision-card card"
            aria-labelledby="focus-vision-card-title"
          >
            <h2 id="focus-vision-card-title" className="focus-card-title">
              <Video size={20} aria-hidden />
              Camera &amp; face detection
            </h2>
            <p className="focus-card-subtitle">
              <strong>MediaPipe</strong> runs in your browser. Video stays on your device; only small numbers (face
              present, gaze, fatigue proxy, etc.) are logged as <code>vision_metrics</code> for research.
            </p>

            <label className="vision-consent">
              <input
                type="checkbox"
                checked={visionConsent}
                onChange={(e) => setVisionConsent(e.target.checked)}
              />
              <span>
                <Shield size={16} style={{ flexShrink: 0, marginTop: 2 }} /> I consent to on-device face landmarks
                while the timer is running. I can turn this off anytime.
              </span>
            </label>
            <label className="vision-sound-consent">
              <input
                type="checkbox"
                checked={soundAlertsEnabled}
                onChange={(e) => {
                  const on = e.target.checked;
                  setSoundAlertsEnabled(on);
                  if (on) void resumeVisionAlertAudio();
                }}
              />
              <span>
                {soundAlertsEnabled ? (
                  <Volume2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                ) : (
                  <VolumeX size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                )}{' '}
                Gentle sounds for check-ins (away from frame, gaze, tired eyes, long time without a blink) and a
                soft ping when you blink (throttled).
              </span>
            </label>

            {visionConsent && (
              <div className="vision-preview-wrap">
                <video ref={videoRef} className="vision-preview" playsInline muted autoPlay />
                <canvas ref={overlayCanvasRef} className="vision-overlay-canvas" aria-hidden />
              </div>
            )}
            {visionActive && blinkPraise && (
              <div className="focus-vision-praise" role="status" aria-live="polite">
                {blinkPraise}
              </div>
            )}
            {visionAlert && (
              <div
                className={`focus-vision-alert focus-vision-alert--${visionAlert.level}`}
                role="status"
                aria-live="polite"
              >
                {visionAlert.text}
              </div>
            )}
            <div className={`vision-status ${visionStatusClass}`}>
              {status === 'off' && 'Camera off (enable consent and start timer to begin).'}
              {status === 'loading' && 'Starting camera and vision model…'}
              {status === 'active' && 'Streaming attention metrics (≈ every 4s).'}
              {status === 'error' && (errorMessage || 'Vision unavailable.')}
            </div>
            {lastSnapshot && (
              <div className="vision-metrics-grid">
                <div className="vision-metric">face_present: {String(lastSnapshot.face_present)}</div>
                <div className="vision-metric">gaze: {lastSnapshot.gaze_bucket}</div>
                <div className="vision-metric">fatigue_proxy: {lastSnapshot.fatigue_proxy}</div>
                <div className="vision-metric">head_yaw: {lastSnapshot.head_yaw_signed}</div>
                <div className="vision-metric">ear_avg: {lastSnapshot.ear_avg ?? '—'}</div>
                <div className="vision-metric">
                  blink L/R: {lastSnapshot.blink_left ?? '—'} / {lastSnapshot.blink_right ?? '—'}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

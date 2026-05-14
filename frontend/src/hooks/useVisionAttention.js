import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api/client';
import { drawFaceOverlay } from '../lib/drawFaceOverlay';
import { computeVisionFrame } from '../lib/visionMetrics';

/* eslint-disable react-hooks/set-state-in-effect --
   Camera/MediaPipe lifecycle is tied to enabled + running; UI status resets when those turn off. */

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

/**
 * Optional on-device face / attention metrics (MediaPipe). Sends only scalars to the API.
 */
export function useVisionAttention({
  enabled,
  running,
  sendIntervalMs = 4000,
  taskId,
  overlayCanvasRef,
}) {
  const [status, setStatus] = useState('off');
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const videoRef = useRef(null);
  const sessionIdRef = useRef(null);
  const lastSendRef = useRef(0);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const boundVideoRef = useRef(null);

  const postMetrics = useCallback(
    async (meta) => {
      const sid = sessionIdRef.current || crypto.randomUUID();
      sessionIdRef.current = sid;
      const res = await apiFetch('/api/interactions', {
        method: 'POST',
        body: {
          session_id: sid,
          event_type: 'vision_metrics',
          metadata: {
            ...meta,
            client_ts: Date.now(),
            focus_task_id: taskId || null,
          },
          page_url: '/focus',
          element_id: 'vision_attention',
          time_spent_ms: null,
        },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
    },
    [taskId],
  );

  useEffect(() => {
    if (!enabled || !running) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (boundVideoRef.current) {
        boundVideoRef.current.srcObject = null;
        boundVideoRef.current = null;
      }
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
      setStatus('off');
      setErrorMessage(null);
      setLastSnapshot(null);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setStatus('loading');
      setErrorMessage(null);
      try {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        if (cancelled) return;
        const lm = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'CPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (cancelled) {
          lm.close?.();
          return;
        }
        landmarkerRef.current = lm;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          lm.close?.();
          landmarkerRef.current = null;
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((t) => t.stop());
          lm.close?.();
          landmarkerRef.current = null;
          return;
        }
        video.srcObject = stream;
        boundVideoRef.current = video;
        await video.play();

        sessionIdRef.current = crypto.randomUUID();
        lastSendRef.current = performance.now();
        setStatus('active');

        const tick = () => {
          if (cancelled) return;
          const landmarker = landmarkerRef.current;
          const vid = boundVideoRef.current;
          if (!landmarker || !vid?.videoWidth) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          const res = landmarker.detectForVideo(vid, performance.now());
          const lmks = res.faceLandmarks?.[0];
          const blend = res.faceBlendshapes?.[0]?.categories;
          const metrics = computeVisionFrame(lmks || [], blend || []);
          setLastSnapshot(metrics);
          const canvas = overlayCanvasRef?.current;
          if (canvas) {
            drawFaceOverlay(canvas, vid, lmks, metrics);
          }
          const now = performance.now();
          if (now - lastSendRef.current >= sendIntervalMs) {
            lastSendRef.current = now;
            postMetrics(metrics).catch((e) => {
              setErrorMessage(e?.message || 'send failed');
            });
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(e?.message || 'Camera or vision model failed');
        }
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (boundVideoRef.current) {
        boundVideoRef.current.srcObject = null;
        boundVideoRef.current = null;
      }
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
    };
  }, [enabled, running, sendIntervalMs, postMetrics, overlayCanvasRef]);

  return { status, lastSnapshot, errorMessage, videoRef };
}

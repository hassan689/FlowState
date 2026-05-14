import { useEffect, useRef } from 'react';
import {
  playVisionAlertTone,
  playVisionBlinkReminderTone,
  playVisionBlinkThanksTone,
} from '../lib/visionAlertAudio';

const COOLDOWN_NO_FACE_MS = 3800;
const COOLDOWN_GAZE_MS = 5200;
const COOLDOWN_FATIGUE_MS = 6500;
const COOLDOWN_BLINK_THANKS_MS = 9000;
const COOLDOWN_BLINK_DRY_MS = 48000;
const DRY_BLINK_MS = 32000;

/**
 * Plays throttled tones for attention warnings and gentle engagement (blink thanks / dry blink).
 * @param {{
 *   active: boolean;
 *   soundEnabled: boolean;
 *   snapshot: object | null;
 *   lastBlinkAtMs: number;
 *   blinkNonce: number;
 * }} opts
 */
export function useVisionSoundAlerts({ active, soundEnabled, snapshot, lastBlinkAtMs, blinkNonce }) {
  const lastRef = useRef({ noFace: 0, gaze: 0, fatigue: 0, blinkThanks: 0, blinkDry: 0 });
  const prevNonceRef = useRef(0);

  useEffect(() => {
    if (!active) {
      prevNonceRef.current = 0;
    }
  }, [active]);

  useEffect(() => {
    if (!active || !soundEnabled || !snapshot) return;

    const now = Date.now();

    if (!snapshot.face_present) {
      if (now - lastRef.current.noFace >= COOLDOWN_NO_FACE_MS) {
        lastRef.current.noFace = now;
        playVisionAlertTone(523, 0.11, 'sine', 0.08);
      }
      return;
    }

    const gaze = snapshot.gaze_bucket;
    if (gaze === 'left' || gaze === 'right') {
      if (now - lastRef.current.gaze >= COOLDOWN_GAZE_MS) {
        lastRef.current.gaze = now;
        playVisionAlertTone(392, 0.09, 'sine', 0.065);
      }
      return;
    }

    const f = typeof snapshot.fatigue_proxy === 'number' ? snapshot.fatigue_proxy : 0;
    if (f > 0.68) {
      if (now - lastRef.current.fatigue >= COOLDOWN_FATIGUE_MS) {
        lastRef.current.fatigue = now;
        playVisionAlertTone(294, 0.18, 'triangle', 0.055);
      }
      return;
    }

    const bl = snapshot.blink_left;
    const br = snapshot.blink_right;
    if (lastBlinkAtMs <= 0 || bl == null || br == null) return;

    const dry = now - lastBlinkAtMs;
    if (dry > DRY_BLINK_MS && now - lastRef.current.blinkDry >= COOLDOWN_BLINK_DRY_MS) {
      lastRef.current.blinkDry = now;
      playVisionBlinkReminderTone();
    }
  }, [active, soundEnabled, snapshot, lastBlinkAtMs]);

  useEffect(() => {
    if (!active || !soundEnabled) return;
    if (blinkNonce === 0) return;
    if (prevNonceRef.current === blinkNonce) return;
    prevNonceRef.current = blinkNonce;
    const now = Date.now();
    if (now - lastRef.current.blinkThanks >= COOLDOWN_BLINK_THANKS_MS) {
      lastRef.current.blinkThanks = now;
      playVisionBlinkThanksTone();
    }
  }, [active, soundEnabled, blinkNonce]);
}

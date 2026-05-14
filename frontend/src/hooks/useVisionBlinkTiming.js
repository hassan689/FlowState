import { useEffect, useRef, useState } from 'react';
import { detectBlinkEdge } from '../lib/visionBlinkEdge';

/**
 * Tracks last blink time from blendshape edges for dry-blink nudges and optional UI/sounds.
 * @param {object | null} snapshot
 * @param {boolean} active running + consent + vision active
 */
export function useVisionBlinkTiming(snapshot, active) {
  const blinkPrevRef = useRef(0);
  const seededRef = useRef(false);
  const [lastBlinkAtMs, setLastBlinkAtMs] = useState(0);
  const [blinkNonce, setBlinkNonce] = useState(0);

  useEffect(() => {
    if (!active) {
      blinkPrevRef.current = 0;
      seededRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset blink clock when vision session ends
      setLastBlinkAtMs(0);
      return;
    }
    if (!snapshot) return;

    if (!snapshot.face_present) {
      blinkPrevRef.current = 0;
      seededRef.current = false;
      return;
    }

    if (!seededRef.current) {
      seededRef.current = true;
      setLastBlinkAtMs(Date.now());
    }

    const { nextPrev, blinked } = detectBlinkEdge(snapshot, blinkPrevRef.current);
    blinkPrevRef.current = nextPrev;
    if (blinked) {
      setLastBlinkAtMs(Date.now());
      setBlinkNonce((n) => n + 1);
    }
  }, [snapshot, active]);

  return { lastBlinkAtMs, blinkNonce };
}

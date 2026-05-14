import { useCallback, useEffect, useRef, useState } from 'react';

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Web Speech API (Chrome / Edge / Safari). Requires HTTPS or localhost.
 * @param {{ onFinal: (text: string) => void }} opts
 */
export function useVoiceRecognition({ onFinal }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  const latestFinalRef = useRef('');

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const supported = Boolean(getRecognitionCtor());

  const stop = useCallback(() => {
    try {
      recRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
    setInterim('');
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    latestFinalRef.current = '';
    try {
      recRef.current?.abort?.();
    } catch {
      /* ignore */
    }

    const rec = new Ctor();
    rec.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += piece;
        else interimText += piece;
      }
      if (finalText) latestFinalRef.current += finalText;
      setInterim(interimText || latestFinalRef.current || '');
    };

    rec.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      setError(e.message || e.error || 'Speech recognition error');
    };

    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      setInterim('');
      const out = latestFinalRef.current.trim();
      latestFinalRef.current = '';
      if (out) onFinalRef.current(out);
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch (e) {
      setError(e?.message || 'Could not start microphone');
      setListening(false);
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, interim, error, setError, start, stop };
}

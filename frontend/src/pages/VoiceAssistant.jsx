import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Mic,
  Info,
  Sparkles,
  LayoutList,
  Target,
  CheckCircle2,
  CheckCircle,
  Square,
  Volume2,
  VolumeX,
  SendHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { handleVoiceTranscript } from '../lib/voiceAssistantBrain';
import { cancelSpeech, ensureVoicesLoaded, speak } from '../lib/voiceSpeak';
import '../styles/pages/VoiceAssistant.css';

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi — I am your Flowstate assistant. Chat with me below, or use the mic for voice. I can navigate the app, mark tasks done, or just talk things through. Try: what should I do next?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [ttsOn, setTtsOn] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const messagesEndRef = useRef(null);

  const secureOk =
    typeof window !== 'undefined' &&
    (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const processUserMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setChatInput('');
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);
    try {
      const result = await handleVoiceTranscript(trimmed, { navigate, apiFetch });
      if (result.cancelTts) cancelSpeech();
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: result.reply }]);
      if (ttsOn && !result.cancelTts) {
        setSpeaking(true);
        await speak(result.reply);
        setSpeaking(false);
      }
    } catch {
      const err = 'Something went wrong while handling that. Please try again.';
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: err }]);
      if (ttsOn) {
        setSpeaking(true);
        await speak(err);
        setSpeaking(false);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [navigate, ttsOn]);

  const onFinal = useCallback(
    (text) => {
      void processUserMessage(text);
    },
    [processUserMessage],
  );

  const { supported, listening, interim, error, setError, start, stop } = useVoiceRecognition({ onFinal });

  useEffect(() => {
    ensureVoicesLoaded();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, listening, interim]);

  const onMicClick = () => {
    setError(null);
    if (listening) {
      stop();
      return;
    }
    cancelSpeech();
    setSpeaking(false);
    start();
  };

  const onChatSubmit = (e) => {
    e.preventDefault();
    void processUserMessage(chatInput);
  };

  return (
    <div className="voice-assistant-page">
      <header className="page-header voice-header">
        <div className="header-icon-wrapper blue-bg">
          <Mic size={24} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <h1>Voice Assistant</h1>
          <p>Type or speak — chat, gentle coaching, and app shortcuts in one place.</p>
        </div>
      </header>

      <div className="voice-content">
        {!secureOk && (
          <div className="demo-banner voice-warn-banner">
            <Info size={16} className="status-icon" color="#b45309" />
            <div className="status-text">
              <h3>Secure connection needed</h3>
              <p>Speech recognition and synthesis work best over HTTPS or on localhost.</p>
            </div>
          </div>
        )}

        {!supported && (
          <div className="demo-banner voice-warn-banner">
            <Info size={16} className="status-icon" color="#b45309" />
            <div className="status-text">
              <h3>Browser not supported</h3>
              <p>Try Chrome or Edge on desktop for speech recognition. You can still read command hints below.</p>
            </div>
          </div>
        )}

        <section className="voice-conversation card">
          <div className="voice-conversation-head">
            <h2>Conversation</h2>
            <label className="voice-tts-toggle">
              <input type="checkbox" checked={ttsOn} onChange={(e) => setTtsOn(e.target.checked)} />
              {ttsOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>Spoken replies</span>
            </label>
          </div>
          <div className="voice-messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((msg) => (
              <div key={msg.id} className={`voice-msg voice-msg--${msg.role}`}>
                <span className="voice-msg-label">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                <p>{msg.text}</p>
              </div>
            ))}
            {listening && interim && (
              <div className="voice-msg voice-msg--user voice-msg--interim">
                <span className="voice-msg-label">You</span>
                <p>{interim}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {error && <p className="voice-inline-error">{error}</p>}
          {speaking && <p className="voice-status-line">Speaking…</p>}
          {busy && !listening && <p className="voice-status-line">Thinking…</p>}

          <form className="voice-chat-form" onSubmit={onChatSubmit}>
            <label htmlFor="voice-chat-input" className="visually-hidden">
              Message to assistant
            </label>
            <input
              id="voice-chat-input"
              type="text"
              className="voice-chat-input"
              placeholder="Type a message… (Enter to send)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={busy}
              autoComplete="off"
            />
            <button type="submit" className="voice-chat-send" disabled={busy || !chatInput.trim()}>
              <SendHorizontal size={20} aria-hidden />
              <span>Send</span>
            </button>
          </form>
        </section>

        <section className="tap-to-speak-card card">
          <button
            type="button"
            className={`large-mic-btn ${listening ? 'large-mic-btn--active' : ''}`}
            onClick={onMicClick}
            disabled={!supported || !secureOk || busy}
            aria-pressed={listening}
            aria-label={listening ? 'Stop listening' : 'Start voice input'}
          >
            {listening ? <Square size={40} color="#ffffff" strokeWidth={2} /> : <Mic size={48} color="#ffffff" strokeWidth={2} />}
          </button>
          <h2>{listening ? 'Listening… tap to stop' : 'Tap to speak'}</h2>
          <p>{listening ? 'Say your command, or tap the button to finish.' : 'Press the microphone, speak clearly, then tap again when you are done.'}</p>
        </section>

        <section className="commands-card card">
          <div className="section-title-wrapper">
            <h2>Things you can say or type</h2>
            <p>Commands run first; everything else gets a conversational reply.</p>
          </div>

          <div className="commands-grid">
            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                <Sparkles size={18} />
              </div>
              <div className="cmd-text">
                <h4>&quot;Create a task&quot;</h4>
                <p>Opens the create-task screen</p>
              </div>
            </div>

            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                <LayoutList size={18} />
              </div>
              <div className="cmd-text">
                <h4>&quot;Show my tasks&quot;</h4>
                <p>Opens your task list</p>
              </div>
            </div>

            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#FCE7F3', color: '#DB2777' }}>
                <Target size={18} />
              </div>
              <div className="cmd-text">
                <h4>&quot;Start focus mode&quot;</h4>
                <p>Opens focus mode</p>
              </div>
            </div>

            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <CheckCircle2 size={18} />
              </div>
              <div className="cmd-text">
                <h4>&quot;Complete …&quot;</h4>
                <p>Mark a task done by title, e.g. &quot;complete math homework&quot;</p>
              </div>
            </div>
          </div>
        </section>

        <section className="features-card card">
          <h2>How it works</h2>
          <ul className="features-list">
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>On-device listening</h4>
                <p>Your browser&apos;s speech recognizer turns your voice into text (check your browser&apos;s privacy notice).</p>
              </div>
            </li>
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Spoken answers</h4>
                <p>Replies use your device&apos;s text-to-speech voice. Turn off &quot;Spoken replies&quot; if you prefer text only.</p>
              </div>
            </li>
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Flowstate actions</h4>
                <p>Navigation and completing tasks use your logged-in account, same as the rest of the app.</p>
              </div>
            </li>
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Text chat</h4>
                <p>Use the box under the conversation for the same replies as voice — handy in class or when you cannot talk.</p>
              </div>
            </li>
          </ul>
        </section>

        <div className="accessibility-first-card">
          <div className="acc-header">
            <CheckCircle2 size={20} color="#10B981" />
            <h3>Tip</h3>
          </div>
          <p className="acc-desc">
            Allow microphone access when prompted, or stick to typing. If recognition is finicky, speak a little slower
            and reduce background noise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;

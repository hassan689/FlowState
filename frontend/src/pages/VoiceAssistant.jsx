import React from 'react';
import { Mic, Info, Sparkles, LayoutList, Target, CheckCircle2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/VoiceAssistant.css';

const VoiceAssistant = () => {
  const navigate = useNavigate();

  return (
    <div className="voice-assistant-page">
      <header className="page-header voice-header">
        <div className="header-icon-wrapper blue-bg">
          <Mic size={24} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <h1>Voice Assistant</h1>
          <p>Control your tasks hands-free with voice commands</p>
        </div>
      </header>

      <div className="voice-content">
        <div className="demo-banner info-status">
          <Info size={16} className="status-icon" color="#2563EB" />
          <div className="status-text">
            <h3>Demo Mode</h3>
            <p>This is a demonstration of voice interaction capabilities. In a production environment, this would connect to speech recognition and natural language processing services.</p>
          </div>
        </div>

        <section className="tap-to-speak-card card">
          <button className="large-mic-btn">
            <Mic size={48} color="#ffffff" strokeWidth={2} />
          </button>
          <h2>Tap to speak</h2>
          <p>Press the microphone to start voice input</p>
        </section>

        <section className="commands-card card">
          <div className="section-title-wrapper">
            <h2>Available Commands</h2>
            <p>Here are some things you can say to the voice assistant</p>
          </div>
          
          <div className="commands-grid">
            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                <Sparkles size={18} />
              </div>
              <div className="cmd-text">
                <h4>"Create a task"</h4>
                <p>Start creating a new task with voice input</p>
              </div>
            </div>

            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                <LayoutList size={18} />
              </div>
              <div className="cmd-text">
                <h4>"Show my tasks"</h4>
                <p>Navigate to your task list</p>
              </div>
            </div>

            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#FCE7F3', color: '#DB2777' }}>
                <Target size={18} />
              </div>
              <div className="cmd-text">
                <h4>"Start focus mode"</h4>
                <p>Begin a focus session</p>
              </div>
            </div>

            <div className="command-item">
              <div className="cmd-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <CheckCircle2 size={18} />
              </div>
              <div className="cmd-text">
                <h4>"Complete task [name]"</h4>
                <p>Mark a specific task as complete</p>
              </div>
            </div>
          </div>
        </section>

        <section className="features-card card">
          <h2>Voice Assistant Features</h2>
          <ul className="features-list">
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Natural Language Processing</h4>
                <p>Understands commands in natural, conversational language</p>
              </div>
            </li>
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Multi-language Support</h4>
                <p>Works with multiple languages and accents</p>
              </div>
            </li>
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Hands-free Operation</h4>
                <p>Perfect for users with motor impairments or while multitasking</p>
              </div>
            </li>
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Voice Feedback</h4>
                <p>Get spoken confirmations and updates for accessibility</p>
              </div>
            </li>
            <li>
              <CheckCircle size={18} color="#10B981" className="feature-icon" />
              <div className="feature-text">
                <h4>Context Awareness</h4>
                <p>Remembers context from previous commands in a session</p>
              </div>
            </li>
          </ul>
        </section>

        <div className="accessibility-first-card">
          <div className="acc-header">
            <CheckCircle2 size={20} color="#10B981" />
            <h3>Accessibility First</h3>
          </div>
          <p className="acc-desc">Voice interaction is designed to make AdaptiveFlow accessible to users with:</p>
          <ul className="acc-list">
            <li>Visual impairments - navigate without seeing the screen</li>
            <li>Motor disabilities - control without precise hand movements</li>
            <li>Cognitive challenges - simpler interaction model</li>
            <li>Multitasking needs - manage tasks while doing other activities</li>
          </ul>
        </div>

        <div className="footer-actions">
          <p>Voice assistance is currently disabled</p>
          <button className="btn-outline" onClick={() => navigate('/settings')}>Enable in Settings</button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;

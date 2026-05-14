import React, { useState } from 'react';
import { MessageSquare, Mail, HelpCircle, Send } from 'lucide-react';
import { apiFetch } from '../api/client';
import '../styles/pages/Feedback.css';

const Feedback = () => {
  const [rating, setRating] = useState(null);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [contactOk, setContactOk] = useState(false);
  const [status, setStatus] = useState('idle');
  const [banner, setBanner] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    if (!rating) {
      setBanner({ type: 'error', text: 'Please choose a rating before submitting.' });
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      setBanner({ type: 'error', text: 'Please enter a short message.' });
      return;
    }

    setStatus('sending');
    try {
      const res = await apiFetch('/api/interactions', {
        method: 'POST',
        body: {
          session_id: crypto.randomUUID(),
          event_type: 'feedback',
          metadata: {
            rating,
            category,
            message: trimmed,
            contact_ok: contactOk,
          },
          page_url: '/feedback',
          element_id: null,
          time_spent_ms: null,
        },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || res.statusText);
      }
      setBanner({ type: 'success', text: 'Thanks — your feedback was saved.' });
      setMessage('');
      setRating(null);
      setContactOk(false);
      setCategory('general');
    } catch (err) {
      setBanner({
        type: 'error',
        text: err?.message || 'Could not send feedback. Check that the API is running and you are logged in.',
      });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="feedback-page">
      <header className="page-header feedback-header">
        <div className="header-icon-wrapper blue-bg">
          <MessageSquare size={24} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <h1>Provide Feedback</h1>
          <p>We&apos;d love to hear your thoughts so we can improve AdaptiveFlow</p>
        </div>
      </header>

      <div className="feedback-content">
        <div className="feedback-form-container card">
          {banner && (
            <div
              className="form-group"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 8,
                background: banner.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: banner.type === 'success' ? '#166534' : '#991b1b',
              }}
            >
              {banner.text}
            </div>
          )}
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>How would you rate your experience?</label>
              <div className="rating-options">
                <button
                  type="button"
                  className={`rating-btn ${rating === 'great' ? 'selected' : ''}`}
                  onClick={() => setRating('great')}
                >
                  <span className="emoji">😍</span>
                  <span>Great</span>
                </button>
                <button
                  type="button"
                  className={`rating-btn ${rating === 'good' ? 'selected' : ''}`}
                  onClick={() => setRating('good')}
                >
                  <span className="emoji">🙂</span>
                  <span>Good</span>
                </button>
                <button
                  type="button"
                  className={`rating-btn ${rating === 'okay' ? 'selected' : ''}`}
                  onClick={() => setRating('okay')}
                >
                  <span className="emoji">😐</span>
                  <span>Okay</span>
                </button>
                <button
                  type="button"
                  className={`rating-btn ${rating === 'poor' ? 'selected' : ''}`}
                  onClick={() => setRating('poor')}
                >
                  <span className="emoji">🙁</span>
                  <span>Poor</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">What is this regarding?</label>
              <div className="custom-select-wrapper">
                <select
                  id="category"
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="ui">Design / UI Issue</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Your thoughts</label>
              <textarea
                id="message"
                className="form-input"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you love, what's frustrating, or what you'd like to see next..."
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={contactOk}
                  onChange={(e) => setContactOk(e.target.checked)}
                />
                <span className="custom-checkbox" />
                <span>It&apos;s okay to contact me about this feedback</span>
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={status === 'sending'}>
              <Send size={18} />
              {status === 'sending' ? 'Sending…' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        <div className="feedback-sidebar">
          <div className="contact-card card bg-gradient-blue">
            <Mail size={24} className="contact-icon" />
            <h3>Direct Contact</h3>
            <p>Have an urgent issue? Reach out directly to our support team.</p>
            <a href="mailto:support@adaptiveflow.app" className="contact-link">
              support@adaptiveflow.app
            </a>
          </div>

          <div className="help-card card bg-light-gray">
            <HelpCircle size={24} className="help-icon text-gray" />
            <h3>Need Help?</h3>
            <p>Check out our comprehensive guides and FAQs.</p>
            <button type="button" className="btn-outline">
              Visit Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

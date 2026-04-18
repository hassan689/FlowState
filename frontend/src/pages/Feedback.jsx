import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Bug, Lightbulb, Mail, HelpCircle, Send } from 'lucide-react';
import '../styles/pages/Feedback.css';

const Feedback = () => {
  const [rating, setRating] = useState(null);

  return (
    <div className="feedback-page">
      <header className="page-header feedback-header">
        <div className="header-icon-wrapper blue-bg">
          <MessageSquare size={24} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <h1>Provide Feedback</h1>
          <p>We'd love to hear your thoughts so we can improve AdaptiveFlow</p>
        </div>
      </header>

      <div className="feedback-content">
        <div className="feedback-form-container card">
          <form className="feedback-form" onSubmit={(e) => e.preventDefault()}>
            
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
                <select id="category" className="form-input">
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
                placeholder="Tell us what you love, what's frustrating, or what you'd like to see next..."
              ></textarea>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="custom-checkbox"></span>
                <span>It's okay to contact me about this feedback</span>
              </label>
            </div>

            <button type="submit" className="btn-submit">
              <Send size={18} />
              Submit Feedback
            </button>
          </form>
        </div>

        <div className="feedback-sidebar">
          <div className="contact-card card bg-gradient-blue">
            <Mail size={24} className="contact-icon" />
            <h3>Direct Contact</h3>
            <p>Have an urgent issue? Reach out directly to our support team.</p>
            <a href="mailto:support@adaptiveflow.app" className="contact-link">support@adaptiveflow.app</a>
          </div>

          <div className="help-card card bg-light-gray">
            <HelpCircle size={24} className="help-icon text-gray" />
            <h3>Need Help?</h3>
            <p>Check out our comprehensive guides and FAQs.</p>
            <button className="btn-outline">Visit Help Center</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

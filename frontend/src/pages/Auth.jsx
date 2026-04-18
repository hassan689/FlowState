import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/Auth.css';

const Auth = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';
  const navigate = useNavigate();

  const handleToggle = (newMode) => {
    navigate(`/${newMode}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-branding">
            <h1>Welcome to Adaptive</h1>
            <p>Your intelligent study companion that adapts to your learning style and helps you achieve academic excellence.</p>
            
            <div className="feature-list">
              <div className="feature">
                <h3>Personalized Learning</h3>
                <p>AI-powered study plans tailored to your needs</p>
              </div>
              <div className="feature">
                <h3>Track Progress</h3>
                <p>Visualize your learning journey with detailed analytics</p>
              </div>
              <div className="feature">
                <h3>Smart Scheduling</h3>
                <p>Optimize your study time with intelligent reminders</p>
              </div>
            </div>
          </div>
          
          <div className="branding-image">
            {/* The desk image with plants matching the design block */}
            <div className="image-placeholder"></div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-header">
            <h2>Adaptive</h2>
            <p>Study Management system</p>
          </div>
          
          <div className="auth-toggle">
            <button 
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => handleToggle('login')}
            >
              Login
            </button>
            <button 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => handleToggle('signup')}
            >
              Sign Up
            </button>
          </div>
          
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); navigate('/progress'); }}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" />
              </div>
            )}
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••••••" />
            </div>
            
            {!isLogin && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••••••" />
              </div>
            )}
            
            {isLogin && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#" className="forgot-link">Forgot password</a>
              </div>
            )}
            
            <button className="submit-btn" type="submit">
              {isLogin ? 'Login' : 'Create Account'}
            </button>
            
            {!isLogin && (
              <p className="terms-text">
                By signing up, you agree to our <strong>Terms and Privacy Policy.</strong>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

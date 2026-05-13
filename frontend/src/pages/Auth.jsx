import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/Auth.css';

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = (newMode) => {
    navigate(newMode === 'login' ? '/login' : '/signup');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-branding">
            <h1>Adaptive Academic Task Manager</h1>
            <p>Flowstate adapts the interface when you hesitate, overload, or switch context — so you can finish what matters.</p>
          </div>
          <div className="branding-image">
            <div className="image-placeholder" />
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-header">
            <h2>AdaptiveFlow</h2>
            <p>Sign in to sync tasks and preferences</p>
          </div>

          <div className="auth-toggle">
            <button type="button" className={`toggle-btn ${isLogin ? 'active' : ''}`} onClick={() => handleToggle('login')}>
              Login
            </button>
            <button type="button" className={`toggle-btn ${!isLogin ? 'active' : ''}`} onClick={() => handleToggle('signup')}>
              Sign Up
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <form className="auth-form" onSubmit={onSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@school.edu" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            {!isLogin && (
              <div className="form-group">
                <label>Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
              </div>
            )}
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : isLogin ? 'Login' : 'Create account'}
            </button>
            <p className="terms-text">
              By continuing you agree to the product terms for class / demo use.{' '}
              <Link to="/login">Already have an account?</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

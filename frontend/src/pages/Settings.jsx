import React from 'react';
import { Settings as SettingsIcon, CheckCircle2, Eye, Type, Palette, Zap, Mic, LayoutTemplate, Info } from 'lucide-react';
import '../styles/pages/Settings.css';

const Settings = () => {
  return (
    <div className="settings-page">
      <header className="page-header settings-header">
        <div className="header-icon-wrapper blue-bg">
          <SettingsIcon size={24} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <h1>Accessibility Settings</h1>
          <p>Customize your experience for comfort and accessibility</p>
        </div>
      </header>

      <div className="settings-content">
        <div className="status-banner info-status">
          <CheckCircle2 size={20} className="status-icon" color="#2563EB" />
          <div className="status-text">
            <h3>Accessibility Features Active</h3>
            <p>No accessibility features currently enabled</p>
          </div>
        </div>

        <section className="settings-section card">
          <div className="section-header">
            <Eye size={18} className="section-icon" />
            <div className="section-title-wrapper">
              <h2>Visual Settings</h2>
              <p>Adjust visual elements for better readability</p>
            </div>
          </div>
          
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-icon"><Eye size={18} /></div>
              <div className="setting-info">
                <label>High Contrast</label>
                <p>Increase contrast for better visibility</p>
              </div>
              <ToggleSwitch />
            </div>

            <div className="setting-item">
              <div className="setting-icon"><Type size={18} /></div>
              <div className="setting-info">
                <label>Large Text</label>
                <p>Increase text size throughout the app</p>
              </div>
              <ToggleSwitch />
            </div>

            <div className="setting-item">
              <div className="setting-icon"><Palette size={18} /></div>
              <div className="setting-info">
                <label>Color Blind Mode</label>
                <p>Adjust colors for color vision deficiency</p>
                <div className="setting-dropdown-wrapper">
                  <select defaultValue="none" className="setting-dropdown">
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia (Red-blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-blind)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section card">
          <div className="section-header">
            <Zap size={18} className="section-icon pink-icon" />
            <div className="section-title-wrapper">
              <h2>Motion & Interaction</h2>
              <p>Control animations and interaction patterns</p>
            </div>
          </div>
          
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-icon"><Zap size={18} /></div>
              <div className="setting-info">
                <label>Reduced Motion</label>
                <p>Minimize animations and transitions</p>
              </div>
              <ToggleSwitch />
            </div>

            <div className="setting-item">
              <div className="setting-icon"><Mic size={18} /></div>
              <div className="setting-info">
                <label>Voice Assistance</label>
                <p>Enable voice commands and feedback</p>
                <span className="future-note">Note: Voice features are planned for future release</span>
              </div>
              <ToggleSwitch />
            </div>
          </div>
        </section>

        <section className="settings-section card">
          <div className="section-header">
            <LayoutTemplate size={18} className="section-icon green-icon" />
            <div className="section-title-wrapper">
              <h2>Layout Settings</h2>
              <p>Simplify the interface to reduce cognitive load</p>
            </div>
          </div>
          
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-icon"><LayoutTemplate size={18} /></div>
              <div className="setting-info">
                <label>Simplified Layout</label>
                <p>Reduce visual complexity and clutter</p>
              </div>
              <ToggleSwitch />
            </div>
          </div>
        </section>

        <div className="about-accessibility-card">
          <h3 className="about-title">About Accessibility</h3>
          <p className="about-desc">
            These settings are designed to make AdaptiveFlow more comfortable and usable for everyone, including users with visual, motor, or cognitive impairments.
          </p>
          <ul className="about-list">
            <li>All settings are saved locally and persist across sessions</li>
            <li>You can combine multiple settings for a customized experience</li>
            <li>Changes take effect immediately without needing to refresh</li>
            <li>These features are compliant with WCAG 2.1 Level AA guidelines</li>
          </ul>
        </div>

        <button className="btn-reset-all">Reset All to Defaults</button>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ checked = false }) => {
  return (
    <label className="toggle-switch">
      <input type="checkbox" defaultChecked={checked} />
      <span className="slider"></span>
    </label>
  );
};

export default Settings;

import React from 'react';
import { Sparkles, Calendar, Plus } from 'lucide-react';
import '../styles/pages/CreateTask.css';

const CreateTask = () => {
  return (
    <div className="create-task-page">
      <header className="page-header">
        <h1>Create New Task</h1>
        <p>Add the details to keep your task organized and actionable.</p>
      </header>

      <div className="content-grid">
        <div className="form-card card">
          <div className="card-header">
            <Sparkles size={20} className="header-icon" color="#2563EB" />
            <h2>Task Details</h2>
          </div>

          <form className="task-form">
            <div className="form-group">
              <label>Task Title <span className="required">*</span></label>
              <input type="text" placeholder="What needs to be done?" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Add more details about this task..." rows="4"></textarea>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Priority</label>
                <div className="select-wrapper">
                  <select defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <span className="priority-dot medium"></span>
                </div>
              </div>

              <div className="form-group half-width">
                <label>Time Estimate (minutes)</label>
                <input type="number" placeholder="e.g., 30" />
              </div>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input type="text" placeholder="Pick a date" />
              </div>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tags-input-wrapper">
                <input type="text" placeholder="Add a tag..." />
                <button type="button" className="add-tag-btn">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-dark full-width">
                <Plus size={18} />
                Create Task
              </button>
              <button type="button" className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>

        <div className="tips-card">
          <div className="card-header">
            <Sparkles size={20} className="header-icon" color="#2563EB" />
            <h2>Pro Tips</h2>
          </div>
          <ul className="tips-list">
            <li>Break large tasks into smaller, actionable steps</li>
            <li>Be specific with your task titles for better clarity</li>
            <li>Use tags to organize related tasks together</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;

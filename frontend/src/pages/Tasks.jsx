import React from 'react';
import { Plus, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import '../styles/pages/Tasks.css';

const Tasks = () => {
  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div className="header-left">
          <h1>Tasks</h1>
          <p>0 tasks found</p>
        </div>
        <button className="btn-dark">
          <Plus size={18} />
          Add Task
        </button>
      </header>

      <section className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search tasks..." className="search-input" />
        </div>
        
        <div className="filter-dropdowns">
          <div className="dropdown">
            <span>All Status</span>
            <ChevronDown size={16} />
          </div>
          <div className="dropdown">
            <span>All Priorities</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      <section className="empty-state-section">
        <div className="empty-state-content">
          <div className="empty-icon-wrapper">
            <CheckCircle2 size={48} strokeWidth={2.5} color="#10B981" />
          </div>
          <h2>No tasks found</h2>
          <p>Create your first task to get started</p>
          <button className="btn-dark mt-4">
            <Plus size={18} />
            Create Task
          </button>
        </div>
      </section>
    </div>
  );
};

export default Tasks;

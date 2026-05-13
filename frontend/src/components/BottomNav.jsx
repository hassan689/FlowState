import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, PlusSquare, Target, TrendingUp } from 'lucide-react';
import '../styles/components/BottomNav.css';

const items = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/create-task', label: 'Add', icon: PlusSquare },
  { to: '/focus', label: 'Focus', icon: Target },
  { to: '/progress', label: 'Stats', icon: TrendingUp },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav adaptive-hide-on-distraction adaptive-hide-hesitation" aria-label="Main">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

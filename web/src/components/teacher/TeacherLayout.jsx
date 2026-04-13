// web/src/components/teacher/TeacherLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">📚 Quiz App <span>Teacher Portal</span></div>
        <nav className="sidebar-nav">
          <NavLink to="/teacher" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>🏠 Dashboard</NavLink>
          <NavLink to="/teacher/questions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>❓ Questions</NavLink>
          <NavLink to="/teacher/scores" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>📊 Student Scores</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{user?.name}</div>
          <button className="btn btn-outline btn-sm w-full" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

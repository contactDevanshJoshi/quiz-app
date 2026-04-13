// web/src/components/student/StudentLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          🎓 Quiz App
          <span>Student Portal</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/student" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/student/subjects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📘 Subjects
          </NavLink>
          <NavLink to="/student/scores" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📊 My Scores
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 12 }}>{user?.id}</div>
          <button className="btn btn-outline btn-sm w-full" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

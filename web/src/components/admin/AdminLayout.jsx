// web/src/components/admin/AdminLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">⚙️ Quiz App <span>Admin Portal</span></div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>🏠 Dashboard</NavLink>
          <NavLink to="/admin/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>👥 Students</NavLink>
          <NavLink to="/admin/subjects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>📘 Subjects</NavLink>
          <NavLink to="/admin/teachers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>🧑‍🏫 Teachers</NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline btn-sm w-full" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

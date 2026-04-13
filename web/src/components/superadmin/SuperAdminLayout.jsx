// web/src/components/superadmin/SuperAdminLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';

export default function SuperAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">👑 Quiz App <span>Super Admin</span></div>
        <nav className="sidebar-nav">
          <NavLink to="/superadmin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>🏠 Dashboard</NavLink>
          <NavLink to="/superadmin/hod" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>🎓 HOD Management</NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline btn-sm w-full" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

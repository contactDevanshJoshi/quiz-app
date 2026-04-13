// web/src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { getAllStudents, getAllSubjects, getAllTeachers } from '../../../../shared/firebase/firestore';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ students: 0, subjects: 0, teachers: 0 });
  useEffect(() => {
    Promise.all([getAllStudents(), getAllSubjects(), getAllTeachers()]).then(([s, sub, t]) => {
      setCounts({ students: s.length, subjects: sub.length, teachers: t.length });
    });
  }, []);
  return (
    <div>
      <div className="page-header"><h1>Admin Dashboard</h1><p>Manage your college quiz system</p></div>
      <div className="grid-3 mb-6">
        <div className="stat-card"><div className="label">Total Students</div><div className="value">{counts.students}</div></div>
        <div className="stat-card"><div className="label">Total Subjects</div><div className="value">{counts.subjects}</div></div>
        <div className="stat-card"><div className="label">Total Teachers</div><div className="value">{counts.teachers}</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/admin/students" className="btn btn-primary">➕ Add Students</a>
          <a href="/admin/subjects" className="btn btn-outline">📘 Manage Subjects</a>
          <a href="/admin/teachers" className="btn btn-outline">🧑‍🏫 Manage Teachers</a>
        </div>
      </div>
    </div>
  );
}

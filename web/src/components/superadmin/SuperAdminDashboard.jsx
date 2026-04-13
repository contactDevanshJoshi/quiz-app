// web/src/components/superadmin/SuperAdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { getDepartments, getAllStudents } from '../../../../shared/firebase/firestore';

export default function SuperAdminDashboard() {
  const [depts, setDepts] = useState([]);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    getDepartments().then(setDepts);
    getAllStudents().then(s => setStudentCount(s.length));
  }, []);

  return (
    <div>
      <div className="page-header"><h1>Super Admin Dashboard</h1><p>College-wide overview</p></div>
      <div className="grid-3 mb-6">
        <div className="stat-card"><div className="label">Departments</div><div className="value">{depts.length}</div></div>
        <div className="stat-card"><div className="label">Total Students</div><div className="value">{studentCount}</div></div>
        <div className="stat-card"><div className="label">HODs Assigned</div><div className="value">{depts.filter(d => d.hod?.name).length}</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Department Overview</h3>
        <div className="table-container">
          <table>
            <thead><tr><th>Department</th><th>HOD Name</th><th>HOD Email</th><th>Status</th></tr></thead>
            <tbody>
              {depts.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.name || d.id}</td>
                  <td>{d.hod?.name || '—'}</td>
                  <td>{d.hod?.email || '—'}</td>
                  <td><span className={`badge ${d.hod?.name ? 'badge-success' : 'badge-warning'}`}>{d.hod?.name ? 'Assigned' : 'Vacant'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

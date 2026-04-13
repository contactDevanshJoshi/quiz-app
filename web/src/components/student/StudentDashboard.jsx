// web/src/components/student/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getDepartment, getStudentScores } from '../../../../shared/firebase/firestore';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dept, setDept] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (user?.department) getDepartment(user.department).then(setDept);
    if (user?.id) getStudentScores(user.id).then(setScores);
  }, [user]);

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, s) => a + (s.score / s.total) * 100, 0) / scores.length)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Semester {user?.semester} · {user?.department}</p>
      </div>

      {/* Info card */}
      <div className="card mb-6">
        <div className="grid-2">
          <div>
            <div className="text-muted">Enrollment No.</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{user?.id}</div>
          </div>
          <div>
            <div className="text-muted">Department</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{user?.department}</div>
          </div>
          <div>
            <div className="text-muted">Semester</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>Semester {user?.semester}</div>
          </div>
          <div>
            <div className="text-muted">HOD</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{dept?.hod?.name || '—'}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="label">Total Quizzes</div>
          <div className="value">{scores.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Score</div>
          <div className="value">{avgScore}%</div>
        </div>
        <div className="stat-card">
          <div className="label">Best Score</div>
          <div className="value">
            {scores.length ? Math.round(Math.max(...scores.map(s => (s.score / s.total) * 100))) + '%' : '—'}
          </div>
        </div>
      </div>

      {/* Recent scores */}
      {scores.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Quiz Results</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Chapter</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td>{s.subjectName}</td>
                    <td>{s.chapterName}</td>
                    <td><span className={`badge badge-${s.difficulty === 'Easy' ? 'success' : s.difficulty === 'Medium' ? 'warning' : 'danger'}`}>{s.difficulty}</span></td>
                    <td><strong>{s.score}/{s.total}</strong></td>
                    <td>{s.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

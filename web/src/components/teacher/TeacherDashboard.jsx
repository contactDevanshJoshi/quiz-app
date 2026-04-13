// web/src/components/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getScoresBySubject, getAllSubjects, getQuestionsBySubject } from '../../../../shared/firebase/firestore';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, totalQuestions: 0, avgScore: 0 });

  useEffect(() => {
    if (!user?.subjectIds?.length) return;
    getAllSubjects().then(all => {
      const mine = all.filter(s => user.subjectIds.includes(s.id));
      setSubjects(mine);

      Promise.all([
        ...mine.map(s => getScoresBySubject(s.id)),
        ...mine.map(s => getQuestionsBySubject(s.id)),
      ]).then(results => {
        const half = Math.floor(results.length / 2);
        const allScores = results.slice(0, half).flat();
        const allQuestions = results.slice(half).flat();
        const avg = allScores.length
          ? Math.round(allScores.reduce((a, s) => a + (s.score / s.total) * 100, 0) / allScores.length)
          : 0;
        setStats({ totalQuizzes: allScores.length, totalQuestions: allQuestions.length, avgScore: avg });
      });
    });
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Teacher Portal — manage your subjects and questions</p>
      </div>
      <div className="grid-3 mb-6">
        <div className="stat-card"><div className="label">My Subjects</div><div className="value">{subjects.length}</div></div>
        <div className="stat-card"><div className="label">Total Quizzes Taken</div><div className="value">{stats.totalQuizzes}</div></div>
        <div className="stat-card"><div className="label">Total Questions</div><div className="value">{stats.totalQuestions}</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>My Subjects</h3>
        {subjects.length === 0
          ? <p className="text-muted">No subjects assigned yet. Ask admin to assign subjects.</p>
          : <div className="card-grid">
            {subjects.map(s => (
              <div key={s.id} className="subject-card">
                <h3>{s.name}</h3>
                <p>{s.department}</p>
                <span className="badge badge-primary" style={{ marginTop: 8 }}>Sem {s.semester}</span>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

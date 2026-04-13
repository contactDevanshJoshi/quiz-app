// web/src/components/student/StudentScores.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getStudentScores } from '../../../../shared/firebase/firestore';

export default function StudentScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getStudentScores(user.id).then(setScores).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="loading">Loading scores...</div>;

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, s) => a + (s.score / s.total) * 100, 0) / scores.length)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1>My Scores</h1>
        <p>All quiz history</p>
      </div>

      <div className="grid-3 mb-6">
        <div className="stat-card"><div className="label">Total Quizzes</div><div className="value">{scores.length}</div></div>
        <div className="stat-card"><div className="label">Average Score</div><div className="value">{avgScore}%</div></div>
        <div className="stat-card">
          <div className="label">Best Score</div>
          <div className="value">{scores.length ? Math.round(Math.max(...scores.map(s => (s.score / s.total) * 100))) + '%' : '—'}</div>
        </div>
      </div>

      {scores.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">No quiz attempts yet. Go take a quiz!</p>
        </div>
      ) : (
        <div>
          {scores.map(s => {
            const pct = Math.round((s.score / s.total) * 100);
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className="card mb-4">
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.subjectName}</div>
                    <div className="text-muted">{s.chapterName} · {s.teachingPhase}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge badge-${s.difficulty === 'Easy' ? 'success' : s.difficulty === 'Medium' ? 'warning' : 'danger'}`}>{s.difficulty}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: pct >= 70 ? '#059669' : pct >= 40 ? '#D97706' : '#DC2626' }}>{s.score}/{s.total}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{pct}%</div>
                    </div>
                    <span style={{ color: '#6B7280' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && s.wrongQuestions?.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                    <p style={{ fontWeight: 500, marginBottom: '0.75rem', color: '#DC2626' }}>Wrong Answers ({s.wrongQuestions.length})</p>
                    {s.wrongQuestions.map((wq, i) => (
                      <div key={i} style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{i + 1}. {wq.text}</p>
                        {wq.options.map((opt, idx) => (
                          <div key={idx} style={{
                            padding: '4px 10px', borderRadius: 6, marginBottom: 3, fontSize: '0.8rem',
                            background: idx === wq.correctIndex ? '#ECFDF5' : idx === wq.selectedIndex ? '#FEF2F2' : '#F9FAFB',
                            color: idx === wq.correctIndex ? '#059669' : idx === wq.selectedIndex ? '#DC2626' : '#374151',
                          }}>
                            {['A','B','C','D'][idx]}. {opt}
                            {idx === wq.correctIndex && ' ✓'}
                            {idx === wq.selectedIndex && idx !== wq.correctIndex && ' ✗'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {isExpanded && (!s.wrongQuestions || s.wrongQuestions.length === 0) && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                    <p style={{ color: '#059669', fontSize: '0.875rem' }}>🎉 Perfect score! No wrong answers.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

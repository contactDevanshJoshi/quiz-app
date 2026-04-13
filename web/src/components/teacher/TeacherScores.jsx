// web/src/components/teacher/TeacherScores.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getAllSubjects, getScoresBySubject } from '../../../../shared/firebase/firestore';
import { toCSV, downloadCSV } from '../../../../shared/utils/csv';

export default function TeacherScores() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDiff, setFilterDiff] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  useEffect(() => {
    getAllSubjects().then(all => {
      const mine = user?.subjectIds?.length ? all.filter(s => user.subjectIds.includes(s.id)) : all;
      setSubjects(mine);
      if (mine.length > 0) loadScores(mine[0]);
    });
  }, [user]);

  async function loadScores(subject) {
    setSelectedSubject(subject);
    setLoading(true);
    getScoresBySubject(subject.id).then(setScores).finally(() => setLoading(false));
  }

  function handleDownload() {
    const cols = ['enrollmentNo', 'studentName', 'chapterName', 'teachingPhase', 'difficulty', 'score', 'total'];
    const csv = toCSV(filtered, cols);
    downloadCSV(csv, `scores_${selectedSubject?.name?.replace(/\s/g,'_')}.csv`);
  }

  const filtered = scores.filter(s =>
    (!filterDiff || s.difficulty === filterDiff) &&
    (!filterStudent || s.studentName?.toLowerCase().includes(filterStudent.toLowerCase()) || s.enrollmentNo?.includes(filterStudent))
  );

  const avg = filtered.length
    ? Math.round(filtered.reduce((a, s) => a + (s.score / s.total) * 100, 0) / filtered.length)
    : 0;

  return (
    <div>
      <div className="page-header"><h1>Student Scores</h1><p>View and download quiz results</p></div>

      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {subjects.map(s => (
          <button
            key={s.id}
            className={`btn ${selectedSubject?.id === s.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => loadScores(s)}
          >{s.name}</button>
        ))}
      </div>

      {selectedSubject && (
        <>
          {/* Stats */}
          <div className="grid-3 mb-6">
            <div className="stat-card"><div className="label">Total Attempts</div><div className="value">{filtered.length}</div></div>
            <div className="stat-card"><div className="label">Average Score</div><div className="value">{avg}%</div></div>
            <div className="stat-card">
              <div className="label">Top Score</div>
              <div className="value">{filtered.length ? Math.round(Math.max(...filtered.map(s => (s.score / s.total) * 100))) + '%' : '—'}</div>
            </div>
          </div>

          {/* Filters + export */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <input className="form-input" style={{ width: 200 }} placeholder="Search student..." value={filterStudent} onChange={e => setFilterStudent(e.target.value)} />
            <select className="form-input form-select" style={{ width: 140 }} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              <option value="">All Levels</option>
              {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={handleDownload}>⬇️ Download CSV</button>
          </div>

          <div className="card">
            {loading ? <div className="loading">Loading...</div> : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Enrollment No.</th>
                      <th>Student Name</th>
                      <th>Chapter</th>
                      <th>Phase</th>
                      <th>Difficulty</th>
                      <th>Score</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => {
                      const pct = Math.round((s.score / s.total) * 100);
                      return (
                        <tr key={s.id}>
                          <td><code>{s.enrollmentNo}</code></td>
                          <td>{s.studentName}</td>
                          <td>{s.chapterName}</td>
                          <td><span className="badge badge-primary">{s.teachingPhase}</span></td>
                          <td><span className={`badge badge-${s.difficulty === 'Easy' ? 'success' : s.difficulty === 'Medium' ? 'warning' : 'danger'}`}>{s.difficulty}</span></td>
                          <td><strong>{s.score}/{s.total}</strong></td>
                          <td style={{ color: pct >= 70 ? '#059669' : pct >= 40 ? '#D97706' : '#DC2626', fontWeight: 600 }}>{pct}%</td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6B7280' }}>No scores yet</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

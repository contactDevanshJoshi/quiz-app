// web/src/components/student/StudentSubjects.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getSubjectsByDeptSemester, getChaptersBySubjectPhase } from '../../../../shared/firebase/firestore';

const PHASES = ['T1', 'T2', 'T3', 'T4'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function StudentSubjects() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [step, setStep] = useState('subjects'); // subjects | phases | chapters | difficulty
  const [selected, setSelected] = useState({ subject: null, phase: null, chapter: null });
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getSubjectsByDeptSemester(user.department, user.semester)
        .then(setSubjects)
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function selectSubject(subject) {
    setSelected({ subject, phase: null, chapter: null });
    setStep('phases');
  }

  async function selectPhase(phase) {
    setSelected(s => ({ ...s, phase }));
    const chs = await getChaptersBySubjectPhase(selected.subject.id, phase);
    setChapters(chs);
    setStep('chapters');
  }

  function selectChapter(chapter) {
    setSelected(s => ({ ...s, chapter }));
    setStep('difficulty');
  }

  function startQuiz(difficulty) {
    navigate('/student/quiz', {
      state: {
        subject: selected.subject,
        phase: selected.phase,
        chapter: selected.chapter, // null means full phase
        difficulty,
      }
    });
  }

  if (loading) return <div className="loading">Loading subjects...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Subjects</h1>
        <p>Semester {user?.semester} · {user?.department}</p>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => setStep('subjects')}>Subjects</span>
        {selected.subject && <><span className="sep">›</span><span onClick={() => setStep('phases')}>{selected.subject.name}</span></>}
        {selected.phase && <><span className="sep">›</span><span onClick={() => setStep('chapters')}>{selected.phase}</span></>}
        {step === 'difficulty' && <><span className="sep">›</span><span>{selected.chapter?.name || `Full ${selected.phase}`}</span></>}
      </div>

      {/* Step: Subjects */}
      {step === 'subjects' && (
        <div className="card-grid">
          {subjects.length === 0 && <p className="text-muted">No subjects found for your semester.</p>}
          {subjects.map(s => (
            <div key={s.id} className="subject-card" onClick={() => selectSubject(s)}>
              <h3>{s.name}</h3>
              <p>{s.code || ''}</p>
              <span className="badge badge-primary" style={{ marginTop: 8 }}>Sem {s.semester}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step: Teaching Phases */}
      {step === 'phases' && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Select Teaching Phase — {selected.subject?.name}</h3>
          <div className="grid-4">
            {PHASES.map(p => (
              <button key={p} className="phase-btn" onClick={() => selectPhase(p)}>
                {p}
                <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 4, color: '#6B7280' }}>Teaching Phase</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Chapters */}
      {step === 'chapters' && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Select Chapter — {selected.phase}</h3>
          <div className="card-grid">
            {/* Full phase option */}
            <div
              className="subject-card"
              onClick={() => selectChapter(null)}
              style={{ borderColor: '#4F46E5', background: '#EEF2FF' }}
            >
              <h3>Full {selected.phase}</h3>
              <p>All chapters in {selected.phase}</p>
            </div>
            {chapters.map(ch => (
              <div key={ch.id} className="subject-card" onClick={() => selectChapter(ch)}>
                <h3>{ch.name}</h3>
                <p>{selected.phase}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Difficulty */}
      {step === 'difficulty' && (
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {selected.chapter ? selected.chapter.name : `Full ${selected.phase}`}
          </h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Select question difficulty</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`difficulty-btn difficulty-${d.toLowerCase()}`}
                onClick={() => startQuiz(d)}
              >
                {d}
                <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 4 }}>
                  {d === 'Easy' ? 'Basic concepts' : d === 'Medium' ? 'Applied knowledge' : 'Advanced problems'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

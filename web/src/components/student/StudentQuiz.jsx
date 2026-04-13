// web/src/components/student/StudentQuiz.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getQuestions, saveScore, shuffleAndPick } from '../../../../shared/firebase/firestore';

const OPTIONS = ['A', 'B', 'C', 'D'];

export default function StudentQuiz() {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]); // {questionId, correct, selected, correctIndex}
  const [phase, setPhase] = useState('quiz'); // quiz | score
  const [loading, setLoading] = useState(true);
  const [savedScore, setSavedScore] = useState(null);
  const [showWrong, setShowWrong] = useState(false);

  useEffect(() => {
    if (!state) { navigate('/student/subjects'); return; }
    const { subject, chapter, difficulty, phase: teachPhase } = state;
    const chapterId = chapter ? chapter.id : 'full';
    getQuestions(subject.id, chapterId, difficulty).then(qs => {
      const picked = shuffleAndPick(qs, 10);
      setQuestions(picked);
      setLoading(false);
    });
  }, []);

  function handleSelect(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const q = questions[current];
    const correct = idx === q.correctIndex;
    setResults(r => [...r, { question: q, selected: idx, correct }]);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  async function finishQuiz() {
    const score = results.filter(r => r.correct).length;
    const wrong = results.filter(r => !r.correct);
    const scoreData = {
      enrollmentNo: user.id,
      studentName: user.name,
      subjectId: state.subject.id,
      subjectName: state.subject.name,
      chapterId: state.chapter?.id || 'full',
      chapterName: state.chapter?.name || `Full ${state.phase}`,
      teachingPhase: state.phase,
      difficulty: state.difficulty,
      score,
      total: questions.length,
      wrongQuestions: wrong.map(w => ({
        text: w.question.text,
        options: w.question.options,
        correctIndex: w.question.correctIndex,
        selectedIndex: w.selected,
      })),
    };
    try {
      await saveScore(scoreData);
    } catch (e) {
      console.error('Save score error:', e);
    }
    setSavedScore(scoreData);
    setPhase('score');
  }

  if (loading) return <div className="loading">Loading questions...</div>;
  if (!state) return null;

  if (questions.length === 0) {
    return (
      <div>
        <div className="page-header"><h1>No Questions Found</h1></div>
        <div className="card text-center">
          <p className="text-muted">No {state.difficulty} questions available for this selection.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/student/subjects')}>Go Back</button>
        </div>
      </div>
    );
  }

  // Score screen
  if (phase === 'score' && savedScore) {
    const pct = Math.round((savedScore.score / savedScore.total) * 100);
    const ringClass = pct >= 70 ? 'good' : pct >= 40 ? 'ok' : 'bad';
    return (
      <div>
        <div className="page-header"><h1>Quiz Complete!</h1></div>
        <div className="card text-center mb-4">
          <div className="score-ring">
            <div className={`score-circle ${ringClass}`}>
              <div className="score-num">{savedScore.score}</div>
              <div className="score-total">/ {savedScore.total}</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 8 }}>{pct}%</div>
            <div className="text-muted">{pct >= 70 ? 'Excellent!' : pct >= 40 ? 'Good effort!' : 'Keep practicing!'}</div>
          </div>
          <div className="grid-3 mt-6" style={{ maxWidth: 400, margin: '1.5rem auto 0' }}>
            <div className="stat-card"><div className="label">Correct</div><div className="value" style={{ color: '#059669' }}>{savedScore.score}</div></div>
            <div className="stat-card"><div className="label">Wrong</div><div className="value" style={{ color: '#DC2626' }}>{savedScore.total - savedScore.score}</div></div>
            <div className="stat-card"><div className="label">Total</div><div className="value">{savedScore.total}</div></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {savedScore.wrongQuestions.length > 0 && (
              <button className="btn btn-outline" onClick={() => setShowWrong(!showWrong)}>
                {showWrong ? 'Hide' : 'Review'} Wrong Answers ({savedScore.wrongQuestions.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/student/subjects')}>Take Another Quiz</button>
            <button className="btn btn-outline" onClick={() => navigate('/student/scores')}>View All Scores</button>
          </div>
        </div>

        {/* Wrong answers review */}
        {showWrong && savedScore.wrongQuestions.map((wq, i) => (
          <div key={i} className="card mb-4">
            <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
              <span className="badge badge-danger">Wrong</span>
              <span style={{ fontWeight: 500 }}>Q{i + 1}</span>
            </div>
            <p style={{ marginBottom: '0.75rem' }}>{wq.text}</p>
            {wq.options.map((opt, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.5rem 0.875rem', borderRadius: 8, marginBottom: 6,
                  border: `2px solid ${idx === wq.correctIndex ? '#059669' : idx === wq.selectedIndex ? '#DC2626' : '#E5E7EB'}`,
                  background: idx === wq.correctIndex ? '#ECFDF5' : idx === wq.selectedIndex ? '#FEF2F2' : 'white',
                  fontSize: '0.875rem',
                }}
              >
                <strong>{OPTIONS[idx]}.</strong> {opt}
                {idx === wq.correctIndex && <span style={{ color: '#059669', marginLeft: 8 }}>✓ Correct answer</span>}
                {idx === wq.selectedIndex && idx !== wq.correctIndex && <span style={{ color: '#DC2626', marginLeft: 8 }}>✗ Your answer</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Quiz screen
  const q = questions[current];
  return (
    <div>
      <div className="page-header">
        <h1>{state.subject.name}</h1>
        <p>{state.chapter?.name || `Full ${state.phase}`} · {state.difficulty}</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3 }}>
          <div style={{ width: `${((current + 1) / questions.length) * 100}%`, height: '100%', background: '#4F46E5', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <span className="text-muted">{current + 1}/{questions.length}</span>
      </div>

      <div className="card">
        <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Q{current + 1}. {q.text}
        </p>

        {q.options.map((opt, idx) => {
          let cls = 'quiz-option';
          if (answered) {
            if (idx === q.correctIndex) cls += ' correct';
            else if (idx === selected) cls += ' wrong';
          } else if (idx === selected) {
            cls += ' selected';
          }
          return (
            <div key={idx} className={cls} onClick={() => handleSelect(idx)}>
              <div className="quiz-option-label">{OPTIONS[idx]}</div>
              <span>{opt}</span>
              {answered && idx === q.correctIndex && <span style={{ marginLeft: 'auto', color: '#059669' }}>✓</span>}
              {answered && idx === selected && idx !== q.correctIndex && <span style={{ marginLeft: 'auto', color: '#DC2626' }}>✗</span>}
            </div>
          );
        })}

        {answered && (
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={handleNext}>
              {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

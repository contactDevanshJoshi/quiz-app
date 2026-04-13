// web/src/components/teacher/TeacherQuestions.jsx
import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { useAuth } from '../../../../shared/hooks/useAuth';
import {
  getAllSubjects, getChaptersBySubject, getQuestionsBySubject,
  addQuestion, updateQuestion, deleteQuestion, bulkAddQuestions
} from '../../../../shared/firebase/firestore';
import { downloadCSV, questionTemplateCSV } from '../../../../shared/utils/csv';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const PHASES = ['T1','T2','T3','T4'];
const emptyForm = {
  text: '', options: ['', '', '', ''], correctIndex: 0,
  difficulty: 'Easy', chapterId: '', subjectId: '', teachingPhase: 'T1'
};

export default function TeacherQuestions() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filterDiff, setFilterDiff] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editQ, setEditQ] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    getAllSubjects().then(all => {
      const mine = user?.subjectIds?.length ? all.filter(s => user.subjectIds.includes(s.id)) : all;
      setSubjects(mine);
      if (mine.length > 0) selectSubject(mine[0]);
    });
  }, [user]);

  async function selectSubject(subject) {
    setSelectedSubject(subject);
    const [chs, qs] = await Promise.all([
      getChaptersBySubject(subject.id),
      getQuestionsBySubject(subject.id)
    ]);
    setChapters(chs);
    setQuestions(qs);
    setForm(f => ({ ...f, subjectId: subject.id }));
  }

  function openAdd() {
    setEditQ(null);
    setForm({ ...emptyForm, subjectId: selectedSubject?.id || '' });
    setShowModal(true);
  }

  function openEdit(q) {
    setEditQ(q);
    setForm({
      text: q.text,
      options: [...q.options],
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
      chapterId: q.chapterId,
      subjectId: q.subjectId,
      teachingPhase: q.teachingPhase,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editQ) {
        await updateQuestion(editQ.id, form);
      } else {
        await addQuestion(form);
      }
      setShowModal(false);
      selectSubject(selectedSubject);
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this question?')) return;
    await deleteQuestion(id);
    selectSubject(selectedSubject);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const questions = data.map(row => ({
            text: row.text,
            options: [row.optionA, row.optionB, row.optionC, row.optionD],
            correctIndex: Number(row.correctIndex),
            difficulty: row.difficulty,
            chapterId: row.chapterId,
            subjectId: row.subjectId || selectedSubject?.id,
            teachingPhase: row.teachingPhase,
          }));
          await bulkAddQuestions(questions);
          alert(`Imported ${questions.length} questions!`);
          selectSubject(selectedSubject);
        } catch (err) { alert('Import error: ' + err.message); }
        finally { setImporting(false); e.target.value = ''; }
      }
    });
  }

  const filtered = questions.filter(q =>
    (!filterDiff || q.difficulty === filterDiff) &&
    (!filterPhase || q.teachingPhase === filterPhase)
  );

  const getChapterName = (id) => chapters.find(c => c.id === id)?.name || id;

  return (
    <div>
      <div className="page-header"><h1>Questions</h1><p>Manage quiz questions by subject</p></div>

      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {subjects.map(s => (
          <button
            key={s.id}
            className={`btn ${selectedSubject?.id === s.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => selectSubject(s)}
          >{s.name}</button>
        ))}
      </div>

      {selectedSubject && (
        <>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <select className="form-input form-select" style={{ width: 140 }} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              <option value="">All Levels</option>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
            <select className="form-input form-select" style={{ width: 120 }} value={filterPhase} onChange={e => setFilterPhase(e.target.value)}>
              <option value="">All Phases</option>
              {PHASES.map(p => <option key={p}>{p}</option>)}
            </select>
            <span className="text-muted">{filtered.length} questions</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => downloadCSV(questionTemplateCSV(), 'question_template.csv')}>📥 Template</button>
              <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()} disabled={importing}>{importing ? 'Importing...' : '📤 Bulk Import'}</button>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
              <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Question</button>
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Question</th><th>Phase</th><th>Chapter</th><th>Difficulty</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((q, i) => (
                    <tr key={q.id}>
                      <td style={{ color: '#9CA3AF' }}>{i + 1}</td>
                      <td style={{ maxWidth: 280 }}><span title={q.text}>{q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text}</span></td>
                      <td><span className="badge badge-primary">{q.teachingPhase}</span></td>
                      <td>{getChapterName(q.chapterId)}</td>
                      <td><span className={`badge badge-${q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'}`}>{q.difficulty}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(q)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6B7280' }}>No questions found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Question modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editQ ? 'Edit Question' : 'Add Question'}</h3>

            <div className="form-group">
              <label className="form-label">Question Text</label>
              <textarea className="form-input" rows={3} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
            </div>

            {['A','B','C','D'].map((label, idx) => (
              <div className="form-group" key={idx}>
                <label className="form-label">Option {label} {form.correctIndex === idx && <span style={{ color: '#059669' }}>✓ Correct</span>}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={form.options[idx]} onChange={e => setForm(f => { const opts = [...f.options]; opts[idx] = e.target.value; return { ...f, options: opts }; })} />
                  <button
                    type="button"
                    className={`btn btn-sm ${form.correctIndex === idx ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => setForm(f => ({ ...f, correctIndex: idx }))}
                  >✓</button>
                </div>
              </div>
            ))}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-input form-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Teaching Phase</label>
                <select className="form-input form-select" value={form.teachingPhase} onChange={e => setForm(f => ({ ...f, teachingPhase: e.target.value }))}>
                  {PHASES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chapter</label>
              <select className="form-input form-select" value={form.chapterId} onChange={e => setForm(f => ({ ...f, chapterId: e.target.value }))}>
                <option value="">Select chapter...</option>
                {chapters.filter(c => c.teachingPhase === form.teachingPhase).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

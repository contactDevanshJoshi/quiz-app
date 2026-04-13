// web/src/components/admin/AdminSubjects.jsx
import React, { useEffect, useState } from 'react';
import {
  getAllSubjects, addSubject, deleteSubject,
  getChaptersBySubject, addChapter, deleteChapter
} from '../../../../shared/firebase/firestore';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'];
const SEMESTERS = [1,2,3,4,5,6,7,8];
const PHASES = ['T1','T2','T3','T4'];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showChModal, setShowChModal] = useState(false);
  const [subForm, setSubForm] = useState({ name: '', code: '', department: DEPARTMENTS[0], semester: 1 });
  const [chForm, setChForm] = useState({ name: '', teachingPhase: 'T1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSubjects(); }, []);

  async function loadSubjects() {
    getAllSubjects().then(setSubjects).finally(() => setLoading(false));
  }

  async function loadChapters(subject) {
    setSelectedSubject(subject);
    const chs = await getChaptersBySubject(subject.id);
    setChapters(chs);
  }

  async function handleAddSubject() {
    setSaving(true);
    try {
      await addSubject({ ...subForm, semester: Number(subForm.semester) });
      setShowSubModal(false);
      loadSubjects();
      setSubForm({ name: '', code: '', department: DEPARTMENTS[0], semester: 1 });
    } finally { setSaving(false); }
  }

  async function handleDeleteSubject(id) {
    if (!window.confirm('Delete this subject?')) return;
    await deleteSubject(id);
    if (selectedSubject?.id === id) setSelectedSubject(null);
    loadSubjects();
  }

  async function handleAddChapter() {
    setSaving(true);
    try {
      await addChapter({ ...chForm, subjectId: selectedSubject.id });
      setShowChModal(false);
      loadChapters(selectedSubject);
      setChForm({ name: '', teachingPhase: 'T1' });
    } finally { setSaving(false); }
  }

  async function handleDeleteChapter(id) {
    if (!window.confirm('Delete this chapter?')) return;
    await deleteChapter(id);
    loadChapters(selectedSubject);
  }

  return (
    <div>
      <div className="page-header"><h1>Subjects & Chapters</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: selectedSubject ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>

        {/* Subjects panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>All Subjects</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSubModal(true)}>➕ Add Subject</button>
          </div>
          {loading ? <div className="loading">Loading...</div> : (
            <div>
              {subjects.map(s => (
                <div
                  key={s.id}
                  className="card mb-4"
                  style={{ cursor: 'pointer', borderColor: selectedSubject?.id === s.id ? '#4F46E5' : undefined }}
                  onClick={() => loadChapters(s)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div className="text-muted">{s.department} · Sem {s.semester}</div>
                      {s.code && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.code}</div>}
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDeleteSubject(s.id); }}>Delete</button>
                  </div>
                </div>
              ))}
              {subjects.length === 0 && <p className="text-muted">No subjects yet.</p>}
            </div>
          )}
        </div>

        {/* Chapters panel */}
        {selectedSubject && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Chapters — {selectedSubject.name}</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowChModal(true)}>➕ Add Chapter</button>
            </div>
            {PHASES.map(phase => {
              const phaseChapters = chapters.filter(c => c.teachingPhase === phase);
              return (
                <div key={phase} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#4F46E5', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{phase}</div>
                  {phaseChapters.length === 0
                    ? <p className="text-muted" style={{ fontSize: '0.8rem', paddingLeft: 8 }}>No chapters</p>
                    : phaseChapters.map(ch => (
                      <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.875rem', background: '#F9FAFB', borderRadius: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.875rem' }}>{ch.name}</span>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteChapter(ch.id)}>×</button>
                      </div>
                    ))
                  }
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject modal */}
      {showSubModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSubModal(false)}>
          <div className="modal">
            <h3>Add Subject</h3>
            <div className="form-group"><label className="form-label">Subject Name</label><input className="form-input" value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Subject Code</label><input className="form-input" value={subForm.code} onChange={e => setSubForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CS301" /></div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input form-select" value={subForm.department} onChange={e => setSubForm(f => ({ ...f, department: e.target.value }))}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select className="form-input form-select" value={subForm.semester} onChange={e => setSubForm(f => ({ ...f, semester: e.target.value }))}>
                  {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowSubModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddSubject} disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter modal */}
      {showChModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowChModal(false)}>
          <div className="modal">
            <h3>Add Chapter to {selectedSubject?.name}</h3>
            <div className="form-group"><label className="form-label">Chapter Name</label><input className="form-input" value={chForm.name} onChange={e => setChForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group">
              <label className="form-label">Teaching Phase</label>
              <select className="form-input form-select" value={chForm.teachingPhase} onChange={e => setChForm(f => ({ ...f, teachingPhase: e.target.value }))}>
                {PHASES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowChModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddChapter} disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

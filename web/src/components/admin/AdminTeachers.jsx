// web/src/components/admin/AdminTeachers.jsx
import React, { useEffect, useState } from 'react';
import { getAllTeachers, addTeacher, updateTeacher, deleteTeacher, getAllSubjects } from '../../../../shared/firebase/firestore';

const emptyForm = { name: '', username: '', password: '', subjectIds: [] };

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllTeachers(), getAllSubjects()]).then(([t, s]) => {
      setTeachers(t); setSubjects(s);
    }).finally(() => setLoading(false));
  }, []);

  function loadTeachers() { getAllTeachers().then(setTeachers); }

  function openAdd() { setEditTeacher(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(t) {
    setEditTeacher(t);
    setForm({ name: t.name, username: t.username, password: '', subjectIds: t.subjectIds || [] });
    setShowModal(true);
  }

  function toggleSubject(id) {
    setForm(f => ({
      ...f,
      subjectIds: f.subjectIds.includes(id)
        ? f.subjectIds.filter(s => s !== id)
        : [...f.subjectIds, id]
    }));
  }

  async function handleSave() {
    setError(''); setSaving(true);
    try {
      if (editTeacher) {
        const updates = { name: form.name, subjectIds: form.subjectIds };
        if (form.password) updates.password = form.password;
        await updateTeacher(editTeacher.id, updates);
      } else {
        await addTeacher({ name: form.name, username: form.username, password: form.password, subjectIds: form.subjectIds });
      }
      setShowModal(false);
      loadTeachers();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this teacher?')) return;
    await deleteTeacher(id);
    loadTeachers();
  }

  return (
    <div>
      <div className="page-header"><h1>Teachers</h1><p>Manage teacher accounts and subject assignments</p></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Teacher</button>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Username</th><th>Assigned Subjects</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.name}</td>
                    <td><code>{t.username}</code></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(t.subjectIds || []).map(sid => {
                          const sub = subjects.find(s => s.id === sid);
                          return sub ? <span key={sid} className="badge badge-primary">{sub.name}</span> : null;
                        })}
                        {(!t.subjectIds || t.subjectIds.length === 0) && <span className="text-muted">None assigned</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#6B7280' }}>No teachers yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>{editTeacher ? 'Edit Teacher' : 'Add Teacher'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            {!editTeacher && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">{editTeacher ? 'New Password (optional)' : 'Password'}</label>
              <input className="form-input" type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Subjects</label>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.5rem' }}>
                {subjects.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={form.subjectIds.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                    {s.name} <span className="text-muted">· {s.department} Sem {s.semester}</span>
                  </label>
                ))}
                {subjects.length === 0 && <p className="text-muted" style={{ fontSize: '0.8rem' }}>No subjects available</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// web/src/components/admin/AdminStudents.jsx
import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  getAllStudents, addStudent, updateStudent, deleteStudent, promoteStudent, bulkAddStudents
} from '../../../../shared/firebase/firestore';
import { toCSV, downloadCSV, studentTemplateCSV } from '../../../../shared/utils/csv';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'];
const SEMESTERS = [1,2,3,4,5,6,7,8];

const emptyForm = { name: '', department: DEPARTMENTS[0], semester: 1, password: '' };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    setLoading(true);
    getAllStudents().then(setStudents).finally(() => setLoading(false));
  }

  function openAdd() { setEditStudent(null); setForm(emptyForm); setEnrollmentNo(''); setShowModal(true); }
  function openEdit(s) { setEditStudent(s); setForm({ name: s.name, department: s.department, semester: s.semester, password: '' }); setEnrollmentNo(s.id); setShowModal(true); }

  async function handleSave() {
    setError(''); setSaving(true);
    try {
      if (editStudent) {
        const updates = { name: form.name, department: form.department, semester: Number(form.semester) };
        if (form.password) updates.password = form.password;
        await updateStudent(editStudent.id, updates);
      } else {
        await addStudent(enrollmentNo, { ...form, semester: Number(form.semester) });
      }
      setShowModal(false);
      loadStudents();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Delete student ${id}?`)) return;
    await deleteStudent(id);
    loadStudents();
  }

  async function handlePromote(id) {
    try { await promoteStudent(id); loadStudents(); }
    catch (e) { alert(e.message); }
  }

  function handleImportCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          await bulkAddStudents(data);
          alert(`Imported ${data.length} students successfully!`);
          loadStudents();
        } catch (err) { alert('Import error: ' + err.message); }
        finally { setImporting(false); e.target.value = ''; }
      }
    });
  }

  function handleExport() {
    const csv = toCSV(students, ['id', 'name', 'department', 'semester', 'password']);
    downloadCSV(csv, 'students.csv');
  }

  const filtered = students.filter(s =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)) &&
    (!filterDept || s.department === filterDept) &&
    (!filterSem || String(s.semester) === filterSem)
  );

  return (
    <div>
      <div className="page-header"><h1>Students</h1><p>Manage all student accounts</p></div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        <input className="form-input" style={{ width: 220 }} placeholder="Search name or enrollment..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input form-select" style={{ width: 180 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="form-input form-select" style={{ width: 130 }} value={filterSem} onChange={e => setFilterSem(e.target.value)}>
          <option value="">All Semesters</option>
          {SEMESTERS.map(s => <option key={s}>Sem {s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => downloadCSV(studentTemplateCSV(), 'student_template.csv')}>📥 Template</button>
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()} disabled={importing}>{importing ? 'Importing...' : '📤 Import CSV'}</button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
          <button className="btn btn-outline btn-sm" onClick={handleExport}>⬇️ Export</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Student</button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Enrollment No.</th><th>Name</th><th>Department</th><th>Semester</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><code>{s.id}</code></td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td><span className="badge badge-primary">Sem {s.semester}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-outline btn-sm" onClick={() => handlePromote(s.id)} title="Promote to next semester">⬆️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#6B7280' }}>No students found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>{editStudent ? 'Edit Student' : 'Add Student'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            {!editStudent && (
              <div className="form-group">
                <label className="form-label">Enrollment No. *</label>
                <input className="form-input" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)} placeholder="e.g. 22CS001" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-input form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select className="form-input form-select" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                  {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{editStudent ? 'New Password (optional)' : 'Password *'}</label>
                <input className="form-input" type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
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

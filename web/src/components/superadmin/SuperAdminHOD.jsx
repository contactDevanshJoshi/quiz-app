// web/src/components/superadmin/SuperAdminHOD.jsx
import React, { useEffect, useState } from 'react';
import { getDepartments, setDepartmentHOD, addDepartment } from '../../../../shared/firebase/firestore';

const DEFAULT_DEPARTMENTS = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'
];

const emptyHOD = { name: '', email: '', phone: '' };

export default function SuperAdminHOD() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState(emptyHOD);
  const [saving, setSaving] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  useEffect(() => { loadDepts(); }, []);

  async function loadDepts() {
    setLoading(true);
    const existing = await getDepartments();
    // Seed default departments if none exist
    if (existing.length === 0) {
      await Promise.all(DEFAULT_DEPARTMENTS.map(name =>
        addDepartment(name.replace(/\s/g, '_').toLowerCase(), { name, hod: {} })
      ));
      getDepartments().then(setDepts).finally(() => setLoading(false));
    } else {
      setDepts(existing);
      setLoading(false);
    }
  }

  function openEdit(dept) {
    setEditDept(dept);
    setForm({ name: dept.hod?.name || '', email: dept.hod?.email || '', phone: dept.hod?.phone || '' });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setDepartmentHOD(editDept.id, form);
      setEditDept(null);
      loadDepts();
    } finally { setSaving(false); }
  }

  async function handleAddDept() {
    if (!newDeptName.trim()) return;
    const id = newDeptName.trim().replace(/\s+/g, '_').toLowerCase();
    await addDepartment(id, { name: newDeptName.trim(), hod: {} });
    setShowAddDept(false);
    setNewDeptName('');
    loadDepts();
  }

  return (
    <div>
      <div className="page-header"><h1>HOD Management</h1><p>Assign Heads of Department per department</p></div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => setShowAddDept(true)}>➕ Add Department</button>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div>
          {depts.map(dept => (
            <div key={dept.id} className="card mb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{dept.name || dept.id}</h3>
                  {dept.hod?.name ? (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                        <strong>HOD:</strong> {dept.hod.name}
                      </div>
                      {dept.hod.email && <div className="text-muted">{dept.hod.email}</div>}
                      {dept.hod.phone && <div className="text-muted">{dept.hod.phone}</div>}
                    </div>
                  ) : (
                    <span className="badge badge-warning">No HOD assigned</span>
                  )}
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(dept)}>
                  {dept.hod?.name ? 'Edit HOD' : 'Assign HOD'}
                </button>
              </div>

              {/* Inline edit form */}
              {editDept?.id === dept.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">HOD Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. John Doe" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="hod@college.edu" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditDept(null)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save HOD'}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add department modal */}
      {showAddDept && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddDept(false)}>
          <div className="modal">
            <h3>Add Department</h3>
            <div className="form-group">
              <label className="form-label">Department Name</label>
              <input className="form-input" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="e.g. Information Technology" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowAddDept(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddDept}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

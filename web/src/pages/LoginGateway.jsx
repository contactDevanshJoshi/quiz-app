// web/src/pages/LoginGateway.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import { loginStudent, loginAdmin, loginTeacher, loginSuperAdmin } from '../../../shared/firebase/firestore';

const roles = [
  { key: 'student',    label: 'Student',     icon: '🎓', desc: 'Login with enrollment number' },
  { key: 'admin',      label: 'Admin',       icon: '⚙️', desc: 'Manage students & subjects' },
  { key: 'teacher',    label: 'Teacher',     icon: '📚', desc: 'Manage questions & scores' },
  { key: 'superadmin', label: 'Super Admin', icon: '👑', desc: 'Manage HODs & departments' },
];

export default function LoginGateway() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (selectedRole === 'student') {
        user = await loginStudent(form.username, form.password);
      } else if (selectedRole === 'admin') {
        user = await loginAdmin(form.username, form.password);
      } else if (selectedRole === 'teacher') {
        user = await loginTeacher(form.username, form.password);
      } else {
        user = await loginSuperAdmin(form.username, form.password);
      }
      login(user, selectedRole);
      navigate(`/${selectedRole === 'superadmin' ? 'superadmin' : selectedRole}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>College Quiz App</h2>
        <p>Select your role to continue</p>

        {!selectedRole ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {roles.map(r => (
              <button
                key={r.key}
                onClick={() => setSelectedRole(r.key)}
                style={{
                  padding: '1rem', border: '2px solid #E5E7EB', borderRadius: '10px',
                  background: 'white', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#4F46E5'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{r.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>{r.desc}</div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <button
              type="button"
              onClick={() => { setSelectedRole(null); setError(''); setForm({ username: '', password: '' }); }}
              style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}
            >
              ← Back to role selection
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{roles.find(r => r.key === selectedRole)?.icon}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{roles.find(r => r.key === selectedRole)?.label} Login</div>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">
                {selectedRole === 'student' ? 'Enrollment Number' : 'Username'}
              </label>
              <input
                className="form-input"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder={selectedRole === 'student' ? 'e.g. 22CS001' : 'Enter username'}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                required
              />
            </div>

            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

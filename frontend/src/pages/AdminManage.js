import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API } from '../context/AuthContext';

export default function AdminManage() {
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await API.get('/auth/admins');
      setAdmins(res.data.admins || []);
    } catch { setAdmins([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/auth/register', form);
      showMsg('success', `Admin "${form.name}" added successfully!`);
      setForm({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to add admin.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (id === currentAdmin.id) return showMsg('error', "You can't delete your own account.");
    if (!window.confirm(`Remove admin "${name}"? They will lose all access.`)) return;
    try {
      await API.delete(`/auth/admins/${id}`);
      setAdmins(admins.filter(a => a.id !== id));
      showMsg('success', `Admin "${name}" removed.`);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to remove admin.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="page-enter">
      <div className="container" style={{ padding: '40px 24px', maxWidth: 900 }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Admin Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add and manage admin accounts for the job board.</p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: 24 }}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16 }}>Current Admins</h2>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{admins.length} total</span>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : admins.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No admins found</div>
            ) : (
              admins.map((a, i) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px',
                  borderBottom: i < admins.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: `hsl(${(a.id * 67) % 360}, 60%, 35%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Syne, sans-serif',
                  }}>
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</p>
                      {a.id === currentAdmin.id && (
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>You</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Joined {formatDate(a.created_at)}</span>
                    {a.id !== currentAdmin.id && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id, a.name)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ padding: 28, position: 'sticky', top: 84 }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Add New Admin</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>New admins can post jobs and manage applications.</p>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Jane Smith" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="jane@unizoy.com" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters" required minLength={6}
                    style={{ paddingRight: 44 }}
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', color: 'var(--text-dim)', padding: 4,
                  }}>
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', padding: 13, marginTop: 4 }}>
                {submitting ? <><div className="spinner" style={{ width: 17, height: 17 }} /> Adding...</> : '+ Add Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

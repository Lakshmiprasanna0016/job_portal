import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login, admin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (admin) { navigate('/admin'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(108,99,255,0.07) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 24, fontWeight: 800, color: '#fff',
              fontFamily: 'Syne, sans-serif',
            }}>U</div>
            <h1 style={{ fontSize: 26, marginBottom: 6 }}>Admin Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to manage Unizoy's job board</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>❌ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="admin@unizoy.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 16, background: 'rgba(108,99,255,0.06)', borderRadius: 'var(--radius)', border: '1px solid rgba(108,99,255,0.15)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
              Default credentials: <strong style={{ color: 'var(--text-muted)' }}>admin@unizoy.com</strong> / <strong style={{ color: 'var(--text-muted)' }}>Admin@123</strong>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-dim)' }}>
            <Link to="/" style={{ color: 'var(--accent)' }}>← Back to job listings</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

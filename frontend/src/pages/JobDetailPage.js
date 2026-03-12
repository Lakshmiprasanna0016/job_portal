import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ candidate_name: '', candidate_email: '', resume_link: '', cover_letter: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    API.get(`/jobs/${id}`)
      .then(res => setJob(res.data.job))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await API.post('/applications', { ...form, job_id: id });
      setMessage({ type: 'success', text: res.data.message });
      setForm({ candidate_name: '', candidate_email: '', resume_link: '', cover_letter: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!job) return null;

  const requirements = job.requirements?.split('\n').filter(Boolean) || [];
  const benefits = job.benefits?.split('\n').filter(Boolean) || [];

  return (
    <div className="page-enter">
      <div className="container" style={{ padding: '40px 24px', maxWidth: 960 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to jobs
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ padding: 32, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase' }}>{job.department}</span>
              </div>
              <h1 style={{ fontSize: 32, marginBottom: 12 }}>{job.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                  {job.job_type}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {job.experience_level} Level
                </span>
                {job.salary_range && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    {job.salary_range}
                  </span>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>About this role</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.description}</p>
            </div>

            {requirements.length > 0 && (
              <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Requirements</h2>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {requirements.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, color: 'var(--text-muted)', fontSize: 14 }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {benefits.length > 0 && (
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Benefits</h2>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {benefits.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, color: 'var(--text-muted)', fontSize: 14 }}>
                      <span style={{ color: 'var(--accent3)', fontWeight: 700, flexShrink: 0 }}>✓</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: 84 }}>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 20, marginBottom: 6 }}>Apply Now</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>Takes less than 2 minutes</p>

              {message && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: 18 }}>
                  {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="John Doe" required
                    value={form.candidate_name} onChange={e => setForm(f => ({ ...f, candidate_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" placeholder="john@example.com" required
                    value={form.candidate_email} onChange={e => setForm(f => ({ ...f, candidate_email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume / CV Link *</label>
                  <input className="form-input" type="url" placeholder="https://drive.google.com/..." required
                    value={form.resume_link} onChange={e => setForm(f => ({ ...f, resume_link: e.target.value }))} />
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Google Drive, Dropbox, LinkedIn, etc.</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Letter (optional)</label>
                  <textarea className="form-input" rows={4} placeholder="Tell us why you're excited about this role..."
                    value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                  {submitting ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Submitting...</> : 'Submit Application →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

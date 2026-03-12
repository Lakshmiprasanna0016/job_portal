import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API } from '../context/AuthContext';

const initialForm = {
  title: '', department: '', location: '', job_type: 'Full-time',
  experience_level: 'Mid', salary_range: '', description: '',
  requirements: '', benefits: '', is_active: true,
};

export default function PostJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const departments = ['Engineering', 'Design', 'Data', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance', 'Product', 'Legal', 'Customer Success'];

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/jobs/${id}`)
      .then(res => {
        const j = res.data.job;
        setForm({
          title: j.title, department: j.department, location: j.location,
          job_type: j.job_type, experience_level: j.experience_level,
          salary_range: j.salary_range || '', description: j.description,
          requirements: j.requirements, benefits: j.benefits || '', is_active: j.is_active
        });
      })
      .catch(() => navigate('/admin/jobs'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        await API.put(`/jobs/${id}`, form);
      } else {
        await API.post('/jobs', form);
      }
      navigate('/admin/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.');
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const inputStyle = {
    background: 'var(--surface2)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)',
    padding: '10px 14px', fontSize: 14, width: '100%', fontFamily: 'DM Sans, sans-serif'
  };
  const labelStyle = {
    fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div className="page-enter">
      <div className="container" style={{ padding: '40px 24px', maxWidth: 780 }}>
        <Link to="/admin/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to jobs
        </Link>

        <h1 style={{ fontSize: 28, marginBottom: 4 }}>{isEdit ? 'Edit Job' : 'Post New Job'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
          {isEdit ? 'Update the job details below.' : 'Fill in the details to create a new job listing.'}
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, marginBottom: 20, color: 'var(--accent)' }}>Basic Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Job Title *</label>
                <input style={inputStyle} placeholder="e.g. Senior Frontend Developer" required value={form.title} onChange={set('title')} />
              </div>
              <div>
                <label style={labelStyle}>Department *</label>
                <select style={inputStyle} required value={form.department} onChange={set('department')}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location *</label>
                <input style={inputStyle} placeholder="e.g. Remote / New York, NY" required value={form.location} onChange={set('location')} />
              </div>
              <div>
                <label style={labelStyle}>Job Type</label>
                <select style={inputStyle} value={form.job_type} onChange={set('job_type')}>
                  {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Experience Level</label>
                <select style={inputStyle} value={form.experience_level} onChange={set('experience_level')}>
                  {['Entry', 'Mid', 'Senior', 'Lead', 'Manager'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Salary Range</label>
                <input style={inputStyle} placeholder="e.g. $80,000 - $120,000" value={form.salary_range} onChange={set('salary_range')} />
              </div>
              {isEdit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={set('is_active')}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                  <label htmlFor="is_active" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Active (visible to candidates)</label>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, marginBottom: 20, color: 'var(--accent)' }}>Job Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Job Description *</label>
                <textarea style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }} required
                  placeholder="Describe the role, responsibilities, team culture..." value={form.description} onChange={set('description')} />
              </div>
              <div>
                <label style={labelStyle}>Requirements *</label>
                <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} required
                  placeholder={"List requirements, one per line\ne.g. 5+ years of React experience"} value={form.requirements} onChange={set('requirements')} />
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Each line will be shown as a separate bullet point</span>
              </div>
              <div>
                <label style={labelStyle}>Benefits</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  placeholder={"List benefits, one per line\ne.g. Health insurance"} value={form.benefits} onChange={set('benefits')} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Link to="/admin/jobs" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Saving...</> : (isEdit ? '✓ Save Changes' : '🚀 Post Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

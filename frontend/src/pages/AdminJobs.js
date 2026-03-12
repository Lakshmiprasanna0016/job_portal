import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/jobs/admin/all');
      setJobs(res.data.jobs || []);
    } catch(e) { setJobs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleToggle = async (id) => {
    try {
      const res = await API.patch(`/jobs/${id}/toggle`);
      setJobs(jobs.map(j => j.id === id ? { ...j, is_active: res.data.is_active } : j));
      showMsg('success', `Job ${res.data.is_active ? 'activated' : 'deactivated'}.`);
    } catch { showMsg('error', 'Failed to update job status.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job? All applications will also be deleted.')) return;
    try {
      await API.delete(`/jobs/${id}`);
      setJobs(jobs.filter(j => j.id !== id));
      showMsg('success', 'Job deleted successfully.');
    } catch { showMsg('error', 'Failed to delete job.'); }
  };

  return (
    <div className="page-enter">
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Manage Jobs</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{jobs.length} total positions</p>
          </div>
          <Link to="/admin/jobs/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Post New Job
          </Link>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: 20 }}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
            <h3 style={{ marginBottom: 8 }}>No jobs posted yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Start by posting your first job opening</p>
            <Link to="/admin/jobs/new" className="btn btn-primary">Post a Job</Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} isAdmin
                onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', job_type: '', experience_level: '' });

  const departments = ['Engineering', 'Design', 'Data', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance', 'Product'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const levels = ['Entry', 'Mid', 'Senior', 'Lead', 'Manager'];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.department) params.append('department', filters.department);
      if (filters.job_type) params.append('job_type', filters.job_type);
      if (filters.experience_level) params.append('experience_level', filters.experience_level);
      const res = await API.get(`/jobs?${params}`);
      const jobList = res && res.data && res.data.jobs ? res.data.jobs : [];
      setJobs(jobList);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const jobCount = Array.isArray(jobs) ? jobs.length : 0;

  const selectStyle = {
    background: 'var(--surface2)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)',
    padding: '10px 14px', fontSize: 14, cursor: 'pointer', minWidth: 140,
  };

  return (
    <div className="page-enter">
      <div style={{
        background: 'linear-gradient(180deg, rgba(108,99,255,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '72px 0 56px',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600,
            color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: 20,
          }}>
            🚀 WE ARE HIRING
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', marginBottom: 16 }}>
            Build the future<br />
            <span style={{ color: 'var(--accent)' }}>at Unizoy</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 40px' }}>
            Join a world-class team shaping the next generation of technology.
          </p>
          <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="form-input"
              style={{ paddingLeft: 48, fontSize: 15, height: 52, borderRadius: 100 }}
              placeholder="Search jobs, roles, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
          <select style={selectStyle} value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <select style={selectStyle} value={filters.job_type} onChange={e => setFilters(f => ({ ...f, job_type: e.target.value }))}>
            <option value="">All Types</option>
            {jobTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={selectStyle} value={filters.experience_level} onChange={e => setFilters(f => ({ ...f, experience_level: e.target.value }))}>
            <option value="">All Levels</option>
            {levels.map(l => <option key={l}>{l}</option>)}
          </select>
          {(filters.department || filters.job_type || filters.experience_level || search) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setFilters({ department: '', job_type: '', experience_level: '' }); setSearch(''); }}>
              Clear filters
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-dim)' }}>
            {loading ? '' : `${jobCount} position${jobCount !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            ❌ {error}
            <button onClick={fetchJobs} style={{ background: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', marginLeft: 8 }}>Retry</button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : jobCount === 0 && !error ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>No positions found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {Array.isArray(jobs) && jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}

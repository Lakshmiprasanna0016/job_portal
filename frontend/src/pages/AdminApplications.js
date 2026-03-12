import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { API } from '../context/AuthContext';

const statusColors = { Pending: 'badge-yellow', Reviewed: 'badge-blue', Shortlisted: 'badge-green', Rejected: 'badge-red', Hired: 'badge-purple' };
const statuses = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

export default function AdminApplications() {
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);

  const jobId = new URLSearchParams(location.search).get('job_id');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (jobId) params.append('job_id', jobId);
      if (filterStatus) params.append('status', filterStatus);
      const res = await API.get(`/applications?${params}`);
      setApplications(res.data.applications);
    } finally { setLoading(false); }
  }, [jobId, filterStatus]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.patch(`/applications/${id}/status`, { status });
      setApplications(apps => apps.map(a => a.id === id ? { ...a, status } : a));
      if (selected?.id === id) setSelected(s => ({ ...s, status }));
      showMsg('success', `Status updated to ${status}`);
    } catch { showMsg('error', 'Failed to update status.'); }
    finally { setUpdatingId(null); }
  };

  const deleteApp = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await API.delete(`/applications/${id}`);
      setApplications(apps => apps.filter(a => a.id !== id));
      if (selected?.id === id) setSelected(null);
      showMsg('success', 'Application deleted.');
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="page-enter">
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Applications</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {jobId ? 'Filtered by job' : `${applications.length} total applications`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
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
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ marginBottom: 8 }}>No applications found</h3>
            <p>Applications will appear here once candidates apply</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Candidate', 'Position', 'Applied', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} style={{
                      borderBottom: '1px solid var(--border)',
                      background: selected?.id === app.id ? 'rgba(108,99,255,0.06)' : 'transparent',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                      onClick={() => setSelected(selected?.id === app.id ? null : app)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = selected?.id === app.id ? 'rgba(108,99,255,0.06)' : 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{app.candidate_name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.candidate_email}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontSize: 13 }}>{app.job_title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{app.department}</p>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(app.applied_at)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          className={`badge ${statusColors[app.status] || 'badge-gray'}`}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                          value={app.status}
                          disabled={updatingId === app.id}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateStatus(app.id, e.target.value)}
                        >
                          {statuses.map(s => <option key={s} style={{ background: 'var(--surface2)', color: 'var(--text)', fontWeight: 600 }}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          <a href={app.resume_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          </a>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteApp(app.id)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected && (
              <div className="card" style={{ padding: 24, position: 'sticky', top: 84 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18 }}>Application Details</h2>
                  <button onClick={() => setSelected(null)} style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Candidate</p>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{selected.candidate_name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.candidate_email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Position</p>
                    <p style={{ fontSize: 14 }}>{selected.job_title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.department}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Status</p>
                    <select style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', padding: '8px 12px', fontSize: 13, width: '100%', cursor: 'pointer' }}
                      value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}>
                      {statuses.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Resume</p>
                    <a href={selected.resume_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Open Resume
                    </a>
                  </div>
                  {selected.cover_letter && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Cover Letter</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, background: 'var(--surface2)', padding: 12, borderRadius: 8 }}>{selected.cover_letter}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Applied</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(selected.applied_at).toLocaleString()}</p>
                  </div>
                  <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => deleteApp(selected.id)}>
                    Delete Application
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

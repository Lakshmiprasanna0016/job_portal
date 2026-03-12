import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{label}</span>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `rgba(${color}, 0.12)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>{icon}</div>
    </div>
    <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--text)', lineHeight: 1 }}>{value}</div>
    {sub && <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{sub}</p>}
  </div>
);

const statusColor = { Pending: 'badge-yellow', Reviewed: 'badge-blue', Shortlisted: 'badge-green', Rejected: 'badge-red', Hired: 'badge-purple' };

export default function AdminDashboard() {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/applications/stats')
      .then(res => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className="page-enter">
      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>Welcome back,</p>
            <h1 style={{ fontSize: 32 }}>{admin?.name} 👋</h1>
          </div>
          <Link to="/admin/jobs/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
          <StatCard label="Total Jobs" value={stats?.totalJobs || 0} icon="💼" color="108,99,255" />
          <StatCard label="Active Jobs" value={stats?.activeJobs || 0} icon="🟢" color="46,213,115" sub="Currently hiring" />
          <StatCard label="Total Applications" value={stats?.totalApplications || 0} icon="📋" color="67,229,203" />
          <StatCard label="Pending Review" value={stats?.pendingApplications || 0} icon="⏳" color="255,165,2" sub="Awaiting action" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Recent Applications */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18 }}>Recent Applications</h2>
              <Link to="/admin/applications" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
            </div>
            {stats?.recentApplications?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.recentApplications.map(app => (
                  <div key={app.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between',
                    padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--radius)',
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{app.candidate_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.job_title}</p>
                    </div>
                    <span className={`badge ${statusColor[app.status] || 'badge-gray'}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No applications yet</p>
            )}
          </div>

          {/* Applications by Status */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Applications by Status</h2>
            {stats?.applicationsByStatus?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.applicationsByStatus.map(({ status, count }) => {
                  const total = stats.totalApplications || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span className={`badge ${statusColor[status] || 'badge-gray'}`}>{status}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No data yet</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <Link to="/admin/jobs" className="btn btn-outline">📋 Manage All Jobs</Link>
          <Link to="/admin/applications" className="btn btn-outline">👥 View All Applications</Link>
          <Link to="/" className="btn btn-outline">🌐 View Public Job Board</Link>
          <Link to="/admin/manage" className="btn btn-outline">👤 Manage Admins</Link>
        </div>
      </div>
    </div>
  );
}

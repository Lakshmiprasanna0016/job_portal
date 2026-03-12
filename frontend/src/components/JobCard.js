import React from 'react';
import { Link } from 'react-router-dom';

const typeColors = {
  'Full-time': 'badge-green',
  'Part-time': 'badge-blue',
  'Contract': 'badge-yellow',
  'Internship': 'badge-purple',
  'Remote': 'badge-blue',
};

const levelColors = {
  'Entry': 'badge-green',
  'Mid': 'badge-blue',
  'Senior': 'badge-purple',
  'Lead': 'badge-yellow',
  'Manager': 'badge-red',
};

export default function JobCard({ job, isAdmin, onToggle, onDelete }) {
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="card" style={{
      padding: '24px',
      opacity: job.is_active === false ? 0.55 : 1,
      position: 'relative',
      overflow: 'visible',
    }}>
      {/* Department chip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--accent)', textTransform: 'uppercase',
        }}>{job.department}</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{timeAgo(job.created_at)}</span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 18, marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>{job.title}</h3>

      {/* Location */}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {job.location}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        <span className={`badge ${typeColors[job.job_type] || 'badge-gray'}`}>{job.job_type}</span>
        <span className={`badge ${levelColors[job.experience_level] || 'badge-gray'}`}>{job.experience_level}</span>
        {job.salary_range && (
          <span className="badge badge-gray">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            {job.salary_range}
          </span>
        )}
        {isAdmin && (
          <span className={`badge ${job.is_active ? 'badge-green' : 'badge-red'}`}>
            {job.is_active ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>

      {/* Description preview */}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
      }}>
        {job.description}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        {isAdmin ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to={`/admin/jobs/${job.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
            <button className="btn btn-outline btn-sm" onClick={() => onToggle(job.id)} style={{
              color: job.is_active ? 'var(--warning)' : 'var(--success)',
              borderColor: job.is_active ? 'var(--warning)' : 'var(--success)',
            }}>
              {job.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(job.id)}>Delete</button>
          </div>
        ) : (
          <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
            View & Apply
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        )}
        {isAdmin && job.application_count > 0 && (
          <Link to={`/admin/applications?job_id=${job.id}`} style={{ fontSize: 13, color: 'var(--accent)' }}>
            {job.application_count} applicant{job.application_count !== 1 ? 's' : ''}
          </Link>
        )}
      </div>
    </div>
  );
}

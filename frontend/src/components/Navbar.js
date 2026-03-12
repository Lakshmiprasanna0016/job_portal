import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link to={to} className="btn btn-outline btn-sm" style={{
      borderColor: isActive(to) ? 'var(--accent)' : undefined,
      color: isActive(to) ? 'var(--accent)' : undefined,
      background: isActive(to) ? 'rgba(108,99,255,0.08)' : undefined,
    }}>{label}</Link>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 12 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif',
          }}>U</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 19, letterSpacing: '-0.03em' }}>
            Uni<span style={{ color: 'var(--accent)' }}>zoy</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {navLink('/', 'Jobs')}
          {admin && (
            <>
              {navLink('/admin', 'Dashboard')}
              {navLink('/admin/jobs', 'Jobs')}
              {navLink('/admin/applications', 'Applications')}
              {navLink('/admin/manage', 'Admins')}
              <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 2px' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                {admin.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
            </>
          )}
          {!admin && (
            <Link to="/admin/login" className="btn btn-primary btn-sm">Admin Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

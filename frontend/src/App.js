import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobs from './pages/AdminJobs';
import PostJobPage from './pages/PostJobPage';
import AdminApplications from './pages/AdminApplications';
import AdminManage from './pages/AdminManage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin (protected) */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/jobs" element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
                <Route path="/admin/jobs/new" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
                <Route path="/admin/jobs/:id/edit" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
                <Route path="/admin/applications" element={<ProtectedRoute><AdminApplications /></ProtectedRoute>} />
                <Route path="/admin/manage" element={<ProtectedRoute><AdminManage /></ProtectedRoute>} />
              </Routes>
            </main>

            <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', marginTop: 40 }}>
              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>
                  Uni<span style={{ color: 'var(--accent)' }}>zoy</span>
                </span>
                <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>© 2024 Unizoy. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

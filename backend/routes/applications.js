const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/applications - Submit application (public)
router.post('/', async (req, res) => {
  const { job_id, candidate_name, candidate_email, resume_link, cover_letter } = req.body;

  if (!job_id || !candidate_name || !candidate_email || !resume_link) {
    return res.status(400).json({ success: false, message: 'Job ID, name, email, and resume link are required.' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(candidate_email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  // Basic URL validation
  try { new URL(resume_link); } catch {
    return res.status(400).json({ success: false, message: 'Invalid resume link URL.' });
  }

  try {
    // Check if job exists and is active
    const [jobRows] = await db.execute('SELECT id, title FROM jobs WHERE id = ? AND is_active = TRUE', [job_id]);
    if (jobRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer active.' });
    }

    // Check for duplicate application
    const [existing] = await db.execute(
      'SELECT id FROM applications WHERE job_id = ? AND candidate_email = ?',
      [job_id, candidate_email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already applied for this position.' });
    }

    const [result] = await db.execute(
      'INSERT INTO applications (job_id, candidate_name, candidate_email, resume_link, cover_letter) VALUES (?, ?, ?, ?, ?)',
      [job_id, candidate_name, candidate_email, resume_link, cover_letter || null]
    );

    res.status(201).json({
      success: true,
      message: `Application submitted successfully for "${jobRows[0].title}". We'll be in touch soon!`,
      id: result.insertId,
    });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/applications - Get all applications (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { job_id, status } = req.query;
    let query = `
      SELECT a.*, j.title as job_title, j.department
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE 1=1
    `;
    const params = [];

    if (job_id) { query += ' AND a.job_id = ?'; params.push(job_id); }
    if (status) { query += ' AND a.status = ?'; params.push(status); }

    query += ' ORDER BY a.applied_at DESC';

    const [rows] = await db.execute(query, params);
    res.json({ success: true, applications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/applications/stats - Get application stats (admin only)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [totalJobs] = await db.execute('SELECT COUNT(*) as count FROM jobs');
    const [activeJobs] = await db.execute('SELECT COUNT(*) as count FROM jobs WHERE is_active = TRUE');
    const [totalApps] = await db.execute('SELECT COUNT(*) as count FROM applications');
    const [pendingApps] = await db.execute('SELECT COUNT(*) as count FROM applications WHERE status = "Pending"');
    const [recentApps] = await db.execute(`
      SELECT a.*, j.title as job_title FROM applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC LIMIT 5
    `);
    const [appsByStatus] = await db.execute(`
      SELECT status, COUNT(*) as count FROM applications GROUP BY status
    `);

    res.json({
      success: true,
      stats: {
        totalJobs: totalJobs[0].count,
        activeJobs: activeJobs[0].count,
        totalApplications: totalApps[0].count,
        pendingApplications: pendingApps[0].count,
        recentApplications: recentApps,
        applicationsByStatus: appsByStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/applications/:id - Get single application (admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.*, j.title as job_title, j.department, j.location
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    res.json({ success: true, application: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/applications/:id/status - Update application status (admin only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    const [existing] = await db.execute('SELECT id FROM applications WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    await db.execute('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Application status updated.', status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/applications/:id - Delete application (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.execute('DELETE FROM applications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Application deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

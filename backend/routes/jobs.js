const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs - Get all active jobs (public)
router.get('/', async (req, res) => {
  try {
    const { department, job_type, experience_level, search } = req.query;
    let query = `
      SELECT j.*, a.name as posted_by_name,
        (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
      FROM jobs j
      LEFT JOIN admins a ON j.posted_by = a.id
      WHERE j.is_active = TRUE
    `;
    const params = [];

    if (department) { query += ' AND j.department = ?'; params.push(department); }
    if (job_type) { query += ' AND j.job_type = ?'; params.push(job_type); }
    if (experience_level) { query += ' AND j.experience_level = ?'; params.push(experience_level); }
    if (search) {
      query += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.department LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY j.created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json({ success: true, jobs: rows });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/jobs/admin/all - Get all jobs including inactive (admin only)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT j.*, a.name as posted_by_name,
        (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
      FROM jobs j
      LEFT JOIN admins a ON j.posted_by = a.id
      ORDER BY j.created_at DESC
    `);
    res.json({ success: true, jobs: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/jobs/:id - Get single job (public)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT j.*, a.name as posted_by_name
      FROM jobs j
      LEFT JOIN admins a ON j.posted_by = a.id
      WHERE j.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    res.json({ success: true, job: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/jobs - Create new job (admin only)
router.post('/', authMiddleware, async (req, res) => {
  const { title, department, location, job_type, experience_level, salary_range, description, requirements, benefits } = req.body;

  if (!title || !department || !location || !description || !requirements) {
    return res.status(400).json({ success: false, message: 'Title, department, location, description, and requirements are required.' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO jobs (title, department, location, job_type, experience_level, salary_range, description, requirements, benefits, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, department, location, job_type || 'Full-time', experience_level || 'Mid', salary_range, description, requirements, benefits, req.admin.id]
    );
    res.status(201).json({ success: true, message: 'Job posted successfully.', id: result.insertId });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/jobs/:id - Update job (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, department, location, job_type, experience_level, salary_range, description, requirements, benefits, is_active } = req.body;

  try {
    const [existing] = await db.execute('SELECT id FROM jobs WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    await db.execute(
      `UPDATE jobs SET title=?, department=?, location=?, job_type=?, experience_level=?, salary_range=?, description=?, requirements=?, benefits=?, is_active=?
       WHERE id=?`,
      [title, department, location, job_type, experience_level, salary_range, description, requirements, benefits, is_active !== undefined ? is_active : true, req.params.id]
    );
    res.json({ success: true, message: 'Job updated successfully.' });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/jobs/:id - Delete job (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT id FROM jobs WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    await db.execute('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/jobs/:id/toggle - Toggle job active status (admin only)
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT is_active FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    const newStatus = !rows[0].is_active;
    await db.execute('UPDATE jobs SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, message: `Job ${newStatus ? 'activated' : 'deactivated'} successfully.`, is_active: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

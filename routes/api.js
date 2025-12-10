// routes/api.js
const express = require('express');
const router = express.Router();

// Basic JSON API for activities
// GET /api/activities?username=&type=&min_duration=&max_duration=
router.get('/activities', (req, res, next) => {
  let sql = `
    SELECT a.id, u.username, a.activity_date, a.activity_type,
           a.duration_minutes, a.intensity, a.distance_km, a.calories, a.notes
    FROM activities a
    JOIN users u ON a.user_id = u.id
  `;
  const conditions = [];
  const params = [];

  if (req.query.username) {
    conditions.push('u.username = ?');
    params.push(req.query.username.trim());
  }

  if (req.query.type) {
    conditions.push('a.activity_type LIKE ?');
    params.push('%' + req.query.type.trim() + '%');
  }

  if (req.query.min_duration) {
    conditions.push('a.duration_minutes >= ?');
    params.push(parseInt(req.query.min_duration, 10));
  }

  if (req.query.max_duration) {
    conditions.push('a.duration_minutes <= ?');
    params.push(parseInt(req.query.max_duration, 10));
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY a.activity_date DESC, a.created_at DESC';

  db.query(sql, params, (err, rows) => {
    if (err) {
      // Return error JSON for debugging
      res.json(err);
      return next(err);
    }
    res.json(rows);
  });
});

module.exports = router;

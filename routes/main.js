// routes/main.js
const express = require('express');
const router = express.Router();

// Middleware to protect routes
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

// Redirect root to /home
router.get('/', (req, res) => {
  res.redirect('/home');
});

// Home page (main landing page)
router.get('/home', (req, res) => {
  res.render('index.ejs');
});

// About page
router.get('/about', (req, res) => {
  res.render('about.ejs');
});

// Search form
router.get('/search', redirectLogin, (req, res) => {
  res.render('search.ejs', { results: null, query: {} });
});

// Search results
router.get('/search_results', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  const { activity_type, min_duration, max_duration, from_date, to_date } = req.query;

  let sql = `
    SELECT *
    FROM activities
    WHERE user_id = ?
  `;
  const params = [userId];

  if (activity_type && activity_type.trim() !== '') {
    sql += ' AND activity_type LIKE ?';
    params.push('%' + activity_type.trim() + '%');
  }

  if (min_duration && min_duration.trim() !== '') {
    sql += ' AND duration_minutes >= ?';
    params.push(parseInt(min_duration, 10));
  }

  if (max_duration && max_duration.trim() !== '') {
    sql += ' AND duration_minutes <= ?';
    params.push(parseInt(max_duration, 10));
  }

  if (from_date && from_date.trim() !== '') {
    sql += ' AND activity_date >= ?';
    params.push(from_date);
  }

  if (to_date && to_date.trim() !== '') {
    sql += ' AND activity_date <= ?';
    params.push(to_date);
  }

  sql += ' ORDER BY activity_date DESC';

  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    res.render('search_results.ejs', {
      results,
      query: {
        activity_type,
        min_duration,
        max_duration,
        from_date,
        to_date
      }
    });
  });
});

// Stats page
router.get('/stats', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;

  const sql = `
    SELECT activity_type,
           COUNT(*) AS session_count,
           SUM(duration_minutes) AS total_minutes,
           SUM(IFNULL(calories, 0)) AS total_calories
    FROM activities
    WHERE user_id = ?
    GROUP BY activity_type
    ORDER BY total_minutes DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return next(err);
    res.render('stats.ejs', { stats: rows });
  });
});

module.exports = router;

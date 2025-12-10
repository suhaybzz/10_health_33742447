// routes/activities.js
const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

// List current user's activities
router.get('/my', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  const sql =
    'SELECT * FROM activities WHERE user_id = ? ORDER BY activity_date DESC, created_at DESC';

  db.query(sql, [userId], (err, rows) => {
    if (err) return next(err);
    res.render('activity_list.ejs', { activities: rows });
  });
});

// Add activity form
router.get('/add', redirectLogin, (req, res) => {
  res.render('add_activity.ejs', {
    errors: [],
    formData: { activity_date: '', activity_type: '', duration_minutes: '', intensity: '', distance_km: '', calories: '', notes: '' }
  });
});

// Handle add activity
router.post(
  '/added',
  redirectLogin,
  [
    check('activity_date')
      .notEmpty()
      .withMessage('Please enter a date.'),
    check('activity_type')
      .trim()
      .notEmpty()
      .withMessage('Please enter an activity type.'),
    check('duration_minutes')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive number of minutes.')
  ],
  (req, res, next) => {
    const userId = req.session.userId;

    const activity_date = req.body.activity_date;
    const activity_type = req.sanitize(req.body.activity_type);
    const duration_minutes = parseInt(req.body.duration_minutes, 10);
    const intensity = req.sanitize(req.body.intensity || '');
    const distance_km = req.body.distance_km
      ? parseFloat(req.body.distance_km)
      : null;
    const calories = req.body.calories
      ? parseInt(req.body.calories, 10)
      : null;
    const notes = req.sanitize(req.body.notes || '');

    const errors = validationResult(req);
    const formData = {
      activity_date,
      activity_type,
      duration_minutes: req.body.duration_minutes,
      intensity,
      distance_km: req.body.distance_km,
      calories: req.body.calories,
      notes
    };

    if (!errors.isEmpty()) {
      return res.status(400).render('add_activity.ejs', {
        errors: errors.array(),
        formData
      });
    }

    const sql = `
      INSERT INTO activities
      (user_id, activity_date, activity_type, duration_minutes, intensity, distance_km, calories, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userId,
      activity_date,
      activity_type,
      duration_minutes,
      intensity,
      distance_km,
      calories,
      notes
    ];

    db.query(sql, params, (err2) => {
      if (err2) return next(err2);

      res.render('activity_added.ejs', {
        activity_type,
        activity_date,
        duration_minutes
      });
    });
  }
);

module.exports = router;

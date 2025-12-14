// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const saltRounds = 10;

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

// Register form
router.get('/register', (req, res) => {
  res.render('register.ejs', { errors: [], formData: {} });
});

// Handle registration
router.post(
  '/registered',
  [
    check('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be 3–20 characters long.'),
    check('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    check('password')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
      .withMessage(
        'Password must be at least 8 characters and include lowercase, uppercase, number and special character.'
      )
  ],
  (req, res, next) => {
    // Sanitise inputs
    const username = req.sanitize(req.body.username);
    const first_name = req.sanitize(req.body.first_name);
    const last_name = req.sanitize(req.body.last_name);
    const email = req.sanitize(req.body.email);
    const password = req.body.password; // we don't sanitise password

    const errors = validationResult(req);
    const formData = { username, first_name, last_name, email };

    if (!errors.isEmpty()) {
      return res.status(400).render('register.ejs', {
        errors: errors.array(),
        formData
      });
    }

    // Hash password & insert user
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) return next(err);

      const sql =
        'INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?, ?)';
      const params = [username, first_name, last_name, email, hashedPassword];

      db.query(sql, params, (err2) => {
        if (err2) {
          // Handle duplicate username
          if (err2.code === 'ER_DUP_ENTRY') {
            return res.status(400).render('register.ejs', {
              errors: [{ msg: 'Username already exists.' }],
              formData
            });
          }
          return next(err2);
        }

        res.send(
          `Hello ${first_name || username}, you are now registered! <a href="/users/login">Go to login</a>`
        );
      });
    });
  }
);

// Login form
router.get('/login', (req, res) => {
  res.render('login.ejs', { error: null });
});

// Handle login
router.post('/loggedin', (req, res, next) => {
  const username = req.sanitize(req.body.username);
  const password = req.body.password;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, rows) => {
    if (err) return next(err);

    if (rows.length === 0) {
      return res.status(401).render('login.ejs', {
        error: 'Incorrect username or password.'
      });
    }

    const user = rows[0];

    bcrypt.compare(password, user.hashed_password, (err2, same) => {
      if (err2) return next(err2);

      if (!same) {
        return res.status(401).render('login.ejs', {
          error: 'Incorrect username or password.'
        });
      }

      // Successful login – store session
      req.session.userId = user.id;
      req.session.username = user.username;

      // Show the home page directly (avoids redirecting to /home at site root)
      res.render('index.ejs');
    });
  });
});

// Logout
router.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out.');
    }
    res.send(
      'You are now logged out. <a href="../home">Return to home page</a>'
    );
  });
});

// List users (for demonstration)
router.get('/list', redirectLogin, (req, res, next) => {
  const sql =
    'SELECT username, first_name, last_name, email, created_at FROM users ORDER BY created_at DESC';
  db.query(sql, [], (err, rows) => {
    if (err) return next(err);
    res.render('users_list.ejs', { users: rows });
  });
});

module.exports = router;

// index.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');

const app = express();
const port = 8000;

// ---------- View engine & static files ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// ---------- Body parsing & sanitisation ----------
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

// ---------- Sessions ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_me_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 20 } // 20 minutes
  })
);

// Make current user available in all views
app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentUsername = req.session.username || null;
  next();
});

// ---------- Database connection pool ----------
const db = mysql.createPool({
  host: process.env.HEALTH_HOST || 'localhost',
  user: process.env.HEALTH_USER || 'health_app',
  password: process.env.HEALTH_PASSWORD || 'qwertyuiop',
  database: process.env.HEALTH_DATABASE || 'health',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

global.db = db;

// ---------- Routes ----------
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const apiRoutes = require('./routes/api');

app.use('/', mainRoutes);
app.use('/users', userRoutes);
app.use('/activities', activityRoutes);
app.use('/api', apiRoutes);

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
  res.render('error.ejs', { error: err });
});

// ---------- Start server ----------
app.listen(port, () => {
  console.log(`HealthTrack app listening on port ${port}...`);
});

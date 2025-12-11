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

      // Successful login
      req.session.userId = user.id;
      req.session.username = user.username;

      // Use a relative redirect so it works both locally and on the VM
      // /users/loggedin  ->  ../  ->  /
      // /usr/343/users/loggedin  ->  ../  ->  /usr/343/
      res.redirect('..');
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
      'You are now logged out. <a href="..">Return to home page</a>'
    );
  });
});

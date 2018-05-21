# Exercise 01

The goal of this exercise is to implement username and password based login using [Passport.js](http://www.passportjs.org/).

# Steps

## Sign-up

Before we allow users to login, we need to let them sign-up to our application first.

### Sign-up form

Add the sign-up form to the views folder (`views/signup.ejs`):

```html
<form method="POST" action="/signup" enctype="application/x-www-form-urlencoded">
    <div class="form-group">
      <label for="login">Login</label>
      <input type="text" class="form-control" id="login" name="login" placeholder="Enter login">
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" class="form-control" id="password" name="password" placeholder="Password">
    </div>
    <div class="form-group">
        <label for="password">Confirm password</label>
        <input type="password" class="form-control" id="confirm_password" name="confirm_password" placeholder="Password">
    </div>
    <button type="submit" class="btn btn-primary">Register</button>
</form>
```

Render the form (`routes/signup.js`):

```javascript
router.get('/', (req, res, next) => {
  res.render('signup', { user: req.user });
});
```

### Registering the user

Create form handler (`routes/signup.js`):

```javascript
router.post('/', (req, res, next) => {
  // ...
  res.redirect('/');
});
```

Validate data coming from the browser:

```javascript
if (!req.body.login) {
  return next(new Error('Login is missing'));
}
if (!req.body.password) {
  return next(new Error('Password is missing'));
}
if (req.body.password !== req.body.confirm_password) {
  return next(new Error('Passwords don\'t match'));
}
```

Then calculate the `bcrypt` hash of the password with a 10 byte long random salt:

```javascript
bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(req.body.password, salt, (err, hash) => {
   // ...
  });
});
```

Store user record in the the database and redirect to the login page:

```javascript
db.register(req.body.login, hash, (err, ok) => {
  if (err) {
    return next(err);
  }
  if (!ok) {
    return next(new Error(`User ${req.body.login} already exists`));
  }

  res.redirect('/login');
});
```

The final handler:

```javascript
router.post('/', (req, res, next) => {
  if (!req.body.login) {
    return next(new Error('Login is missing'));
  }
  if (!req.body.password) {
    return next(new Error('Password is missing'));
  }
  if (req.body.password !== req.body.confirm_password) {
    return next(new Error('Passwords don\'t match'));
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      db.register(req.body.login, hash, (err, ok) => {
        if (err) {
          return next(err);
        }
        if (!ok) {
          return next(new Error(`User ${req.body.login} already exists`));
        }
        
        res.redirect('/login');
      });
    });
  });
});
```
## Sessions

Configure sessions in the Express framework (`app.js`):

```javascript
app.use(session({
  secret: 's3cr3t',
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    // We really should be setting this!
    // secure: true,
  },
  name: 'id-workshop-session-cookie',
  resave: false,
  saveUninitialized: false
}));
```

Make sure to select a strong s3cr3t!

## Login

### Login form

Add the sign-up form to the views folder (`views/login.ejs`):

```html
<form method="POST" action="/login" enctype="application/x-www-form-urlencoded">
    <div class="form-group">
        <label for="login">Login</label>
        <input type="text" class="form-control" id="login" name="login" placeholder="Enter login">
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" class="form-control" id="password" name="password" placeholder="Password">
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
    <hr />
    <a href="/signup">Do not have an account?</a>
</form>
```

Render the form (`routes/login.js`):

```javascript
router.get('/', (req, res, next) => {
  res.render('login', { user: req.user });
});
```

### Configure Passport

Configure the Passport middleware (`app.js`):

```javascript
app.use(passport.initialize());
app.use(passport.session());
```

### Configure Passport with sessions

Passport needs to know how to store user information in the session and how to retrieve it:

```javascript
const db = require('./data');

passport.serializeUser((user, cb) => {
  cb(null, user.username);
});

passport.deserializeUser((username, cb) => {
  db.user(username, (err, user) => cb(err, user));
});
```

### Configure Passport strategy

The last step is to configure relevant Passport strategy:

```javascript
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
  },
  (username, password, cb) => {
    // ...
  }
));
```

Query database to find the user:

```javascript
(username, password, cb) => {
  db.user(username, (err, user) => {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb(null, false);
    }
    // ...
  });
}
```

Verify the password:

```javascript
bcrypt.compare(password, user.hash, (err, match) => {
  cb(err, match ? user : false);
});
```

### Handle login form

Create form handler (`routes/login.js`):

```javascript
const passport = require('passport');
//...
router.post('/', passport.authenticate('local', { 
  successRedirect: '/',
  failureRedirect: '/login'
}));
```

## Logout

Add logout link in the navigation bar (`views/header.ejs`):

```html
<nav class="navbar navbar-light bg-light">
    <span class="navbar-brand mb-0 h1">Identity in modern Web applications</span>
    <span class="navbar-text"><%= user.username %></span>
    <a class="nav-link" href="/logout">Logout</a>
</nav>
```

Add logout handler (`app.js`):

```javascript
app.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('id-workshop-session-cookie');
  res.redirect('/login');
});
```

## Extra points

Implement a password strength policy of minimum 8 characters.

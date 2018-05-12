const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const process = require('process');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');

const anonymousAuth = require('./middleware/anonymousAuth');

const indexRouter = require('./routes/index');
const todoRouter = require('./routes/todo');
const loginRouter = require('./routes/login');
const healthCheckRouter = require('./routes/healthcheck');
const apiRouter = require('./api/todo');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.use(passport.initialize());
app.use(passport.session());

const db = require('./data');

passport.serializeUser((user, cb) => {
  cb(null, user.user_id);
});

passport.deserializeUser((user_id, cb) => {
  db.user(user_id, (err, user) => cb(err, user));
});

const Auth0Strategy = require('passport-auth0');

passport.use(new Auth0Strategy({
    domain: 'infoshare2018.eu.auth0.com',
    clientID: process.env.AUTH0_CLIENTID,
    clientSecret: process.env.AUTH0_CLIENTSECRET,
    callbackURL: 'http://localhost:3000/login/callback'
  },
  (accessToken, refreshToken, params, profile, cb) => {
    db.store(profile, (err) => cb(err, profile));
  }
));

// add anonymous user
app.use(anonymousAuth);

app.use('/', indexRouter);
app.use('/todo', todoRouter);
app.use('/login', loginRouter);
app.use('/check', healthCheckRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

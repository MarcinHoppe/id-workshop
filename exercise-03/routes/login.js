const express = require('express');
const passport = require('passport');
const process = require('process');
const db = require('../data');

const router = express.Router();

router.get('/', passport.authenticate('auth0', {
    clientID: process.env.AUTH0_CLIENTID,
    domain: 'infoshare2018.eu.auth0.com',
    redirectUri: 'http://localhost:3000/login/callback',
    audience: 'https://infoshare2018.eu.auth0.com/userinfo',
    responseType: 'code',
    scope: 'openid profile email'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router;

# Exercise 01

The goal of this exercise is to implement federated login using [Passport.js](http://www.passportjs.org/) and [Auth0](https://auth0.com).

# Steps

## Login

First things is to configure the login with Passport.

### Configure Passport

Some Passport configuration scaffoling is already provided but the `passport-auth0` strategy needs to be configured (`app.js`):

```javascript
const Auth0Strategy = require('passport-auth0');

passport.use(new Auth0Strategy({
    domain: 'infoshare2018.eu.auth0.com',
    clientID: process.env.AUTH0_CLIENTID,
    clientSecret: process.env.AUTH0_CLIENTSECRET,
    callbackURL: 'http://localhost:3000/login/callback'
  },
  (accessToken, refreshToken, params, profile, cb) => {
    // ...
  }
));
```

The callback will be invoked when the authentication process completes. At this point we need to store user profile in the database:

```javascript
(accessToken, refreshToken, params, profile, cb) => {
  db.store(profile, (err) => cb(err, profile));
}
```

Note that the `db.store` function will add a new record if the user signed in for the first time and update an existing record for returning users. See `data/index.js` for more details.

### Handle login request

Create login handler (`routes/login.js`):

```javascript
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
```

### Implement OpenID Connect callback

Now that we can start the OpenID Connect flow, implement the callback:

```javascript
router.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/'
  }),
  (req, res) => {
    res.redirect('/');
  }
);
```

## Configuration

Running this exercise requires setting two environment variables to authenticate `id-workshop` against Auth0 authorization server:

```bash
$ AUTH0_CLIENTID=... AUTH0_CLIENTSECRET=... npm start
```

Ask the trainer for the right values!

## Extra points

Implement logout and display other user profile attributes in the navigation bar.

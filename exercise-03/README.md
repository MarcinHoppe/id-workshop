# Exercise 01

The goal of this exercise is to implement access control to a REST API using OAuth 2.0 access tokens.

# Steps

## Audience and scopes

Access tokens we received so far were only usable at the OpenID Connect `/userinfo` endpoint to obtain profile information. Let's now request access tokens that we can use at our own API (`routes/login.js`):

```javascript
router.get('/', passport.authenticate('auth0', {
    // ...
    audience: 'http://localhost:3000/api',
    scope: 'openid profile email mark_as_done'
    // ...
);
```

## Bearer tokens

We will use access tokens received from Auth0 to authorize calls to the internal REST API.

### Client

Access token is returned to the `verify` callback passed to `Auth0Strategy`. We will store this token along with the user profile (`app.js`):

```javascript
(accessToken, refreshToken, params, profile, cb) => {
  profile.access_token = accessToken;
  db.store(profile, (err) => cb(err, profile));
}
```

We will use this token with the Bearer Authentication scheme (`routes/todo.js`):

```javascript
const options = {
  // ...
  auth: {
    bearer: req.user.access_token,
  },
  json: {
    id,
  }
};
```

Notice that we no longer explicitly pass the user identifier in the request payload. Access token carries the same information.

### Server

We will use the `passport-http-bearer` strategy to validate the token (`app.js`):

```javascript
const BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
  (token, cb) => {
    // ...
  }
));
```

Inside the `verify` callback we need to validate the token signature. Auth0 public key is stored in `auth0.pem` file:

```javascript
fs.readFile(path.join(__dirname, 'auth0.pem'), (err, cert) => {
  jwt.verify(token, cert, (err, payload) => {
    if (err) {
      return cb(err);
    }
    cb(null, payload);
  });
});
```

The last step is to use this Passport strategy in the REST API (`api/todo.js`):

```javascript
router.post('/done', passport.authenticate('bearer', { session: false }), (req, res) => {
  if (typeof req.body.id !== 'number') {
    res.status(400);
    return res.end('Bad request');
  }
  // ...
});
```

Inside the API handler, we need to verify individual claims. We need to check if the token was issued for our API:

```javascript
const access_token = req.user;
if (!_.includes(access_token.aud, 'http://localhost:3000/api')) {
  res.status(401);
  return res.end('Bad token');
}
```

Then we need to check if the token represents sufficient privileges granted by the user:

```javascript
const scopes = access_token.scope.split(' ');
if (!_.includes(scopes, 'mark_as_done')) {
  res.status(401);
  return res.end('Insufficient privileges');
}
```

We also need to check if the token has not expired:

```javascript
const now = Math.floor(Date.now() / 1000);
if (!access_token.exp || now > access_token.exp) {
  res.status(401);
  return res.end('Token expired');
}
```

Finally, we need to use user ID from the token in the database operation:

```javascript
db.done(req.user.sub, req.body.id, (err) => {
  // ...
});
```

## Extra points

Implement logout and display other user profile attributes in the navigation bar.

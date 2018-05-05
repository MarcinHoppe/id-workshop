const express = require('express');
const uid = require('uid-safe');
const db = require('../data');

const router = express.Router();

router.get('/', (req, res, next) => {
  const user = uid.sync(32);
  db.add(user, 'sample', (err) => {
    if (err) {
      return next(err);
    }

    db.done(user, 0, (err) => {
      if (err) {
        return next(err);
      }

      db.all(user, (err) => {
        if (err) {
          return next(err);
        }

        db.remove(user, (err) => {
          if (err) {
            return next(err);
          }

          res.render('healthcheck');
        });
      });
    });
  });
});

module.exports = router;

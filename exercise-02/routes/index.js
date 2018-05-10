const express = require('express');
const _ = require('lodash');
const db = require('../data');

const router = express.Router();

router.get('/', (req, res, next) => db.all(req.user.user_id, (err, todos) => {
  if (err) {
    return next(err);
  }

  const [done, todo] = _.partition(todos, item => item.done);

  res.render('index', { user: req.user, done, todo });
}));

module.exports = router;

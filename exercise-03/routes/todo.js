const express = require('express');
const request = require('request');
const _ = require('lodash');
const db = require('../data');

const router = express.Router();

function apiUrl(req) {
  return `${req.protocol}://${req.get('host')}/api/done`;
}

router.post('/', (req, res, next) => {
  if (!req.body.todo) {
    return next(new Error('Cannot add an empty todo item to the database.'));
  }

  db.add(req.user, req.body.todo, (err) => {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
});

router.post('/done', (req, res, next) => {
  const submitted = _.keys(req.body);
  
  if (!submitted) {
    return next(new Error('No todo marked as done.'));
  }

  if (submitted.length > 1) {
    return next(new Error('More than one todo marked as done.'));
  }

  const id = _.parseInt(submitted[0].slice('todo_'.length));

  const options = {
    uri: apiUrl(req),
    method: 'POST',
    json: {
      user: req.user,
      id,
    },
  };

  request.post(options, (err, response, body) => {
    if (err) {
      return next(err);
    }

    if (response.statusCode !== 200) {
      return next(new Error(`Received response ${response.statusCode}: ${body}`));
    }

    res.redirect('/');
  });
});

module.exports = router;

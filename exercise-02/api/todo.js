const express = require('express');
const db = require('../data');

const router = express.Router();

router.post('/done', (req, res) => {
  if (!req.body || !req.body.user || typeof req.body.id !== 'number') {
    res.status(400);
    return res.end('Bad request');
  }

  db.done(req.body.user, req.body.id, (err) => {
    if (err) {
      res.status(400);
      return res.end(err);
    }
    
    res.status(200);
    res.end('OK');
  });
});

module.exports = router;

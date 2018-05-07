function addAnonymousUser(req, res, next) {
  req.user = req.user || { username: 'anonymous' };
  next();
}

module.exports = addAnonymousUser;

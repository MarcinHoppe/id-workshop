function addAnonymousUser(req, res, next) {
  req.user = req.user || 'anonymous';
  next();
}

module.exports = addAnonymousUser;

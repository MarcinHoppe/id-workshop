function addAnonymousUser(req, res, next) {
  req.user = req.user || { user_id: 'anonymous', displayName: 'anonymous' };
  next();
}

module.exports = addAnonymousUser;

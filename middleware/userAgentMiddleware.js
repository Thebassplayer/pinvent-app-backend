const UserAgent = (req, res, next) => {
  req.userAgent = req.headers["user-agent"];
  next();
};

module.exports = UserAgent;

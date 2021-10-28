const { UnauthorizedError } = require('../errors');
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Authorization Failed.');
    }
    next();
  };
};

module.exports = authorizePermissions;

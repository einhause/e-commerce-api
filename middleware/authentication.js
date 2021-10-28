const { UnauthenticatedError } = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnauthenticatedError('Authentication invalid.');
  }

  try {
    const { userId, name, role } = isTokenValid({ token });
    req.user = {
      name: name,
      userId: userId,
      role: role,
    };
    next();
  } catch (err) {
    throw new UnauthenticatedError('Authentication invalid.');
  }
};

module.exports = authenticateUser;

const { saltAndHash, arePasswordsMatching } = require('./bcryptFuncs');
const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./createTokenUser');
const checkPermissions = require('./checkPermissions');

module.exports = {
  saltAndHash,
  arePasswordsMatching,
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
};

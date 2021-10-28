const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError(
      'Email already in use, please try a different one.'
    );
  }

  // Assigns first account registered ever to be an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({ email, name, password, role });

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({
    res,
    user: tokenUser,
  });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new CustomError.BadRequestError(
      'Please provide an email and a password'
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const isAuthenticated = await user.comparePasswords(password);
  if (!isAuthenticated) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({
    res,
    user: tokenUser,
  });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
};

module.exports = {
  register,
  login,
  logout,
};

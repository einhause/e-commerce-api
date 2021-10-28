const User = require('../models/User');
const {
  StatusCodes: { OK },
} = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' });
  res.status(OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select('-password');

  if (!user) {
    throw new BadRequestError('User not found.');
  }

  checkPermissions(req.user, user._id);

  res.status(OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  res.status(OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const {
    body: { email, name },
    user: { userId },
  } = req;
  if (!email || !name) {
    throw new BadRequestError('Please provide an email and a name');
  }

  const user = await User.findById(userId);

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({
    res,
    user: tokenUser,
  });

  res.status(OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide your old and new passwords.');
  }

  const user = await User.findById(req.user.userId);
  const isPasswordValid = await user.comparePasswords(oldPassword);

  if (!isPasswordValid) {
    throw new UnauthenticatedError('Invalid credentials.');
  }

  user.password = newPassword;

  await user.save();
  res.status(OK).json({ msg: 'Success! You password was updated.' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

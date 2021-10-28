const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { arePasswordsMatching, saltAndHash } = require('../utils');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide an email'],
    validate: {
      validator: isEmail,
      message: 'Please provide a valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await saltAndHash(this.password);
});

UserSchema.methods.comparePasswords = async function (userInputPassword) {
  return await arePasswordsMatching(userInputPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

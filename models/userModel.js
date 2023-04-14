const mongoose = require('mongoose');

// validator package for email validation
const validator = require('validator');

// use bcryptjs to encrypt password
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // validator function can only return true or false: only works for CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

// pre hook to encrypt password
userSchema.pre('save', async function (next) {
  // only encrypt password when updating it
  if (!this.isModified('password')) return next();

  // generate random string/salt value into password: hash the password with cost of 12
  // the more cost, the more generate time
  this.password = await bcrypt.hash(this.password, 12);
  // do not persist confirm password in the database
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;

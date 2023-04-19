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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin' ],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    // do not show password in the response
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // validator function can only return true or false: only works for CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date
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

// const an instance available for all users documents to check input password is as the same as password in the database
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  // encrypt input password and compare it with the one in the db
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if user changed password after token is issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp){
  if(this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log('compare ------>',changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // false means password is not changed after token issued
  return false;
}

const User = mongoose.model('user', userSchema);

module.exports = User;

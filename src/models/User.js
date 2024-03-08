const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide your username"],
    minlength: [2, "Username must be at least 2 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"]
  },
  firstName: { 
    type: String,
    required: [true, "Please provide your first name"],
    minlength: [2, "First name must be at least 2 characters long"],
    maxlength: [30, "First name cannot exceed 30 characters"]
  },
  lastName: { 
    type: String,
    required: [true, "Please provide your last name"],
    minlength: [1, "Last name must be at least 1 character long"],
    maxlength: [30, "Last name must be no more than 30 characters long"]
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email address in this format: name@example.com',
    ],  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    validate: {
      validator: function (password) {
        return password.length >= 6;
      },
      message: 'Password should be at least 6 characters long',
    },
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  watchList: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
}, { timestamps: true });

const UserModel = mongoose.model("User", UserSchema, "Users");

module.exports = UserModel;

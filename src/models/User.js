const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const urlValidationPattern = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/;

const validateURL = (url) => {
    if (url === null) {
      return true; 
    }
    return urlValidationPattern.test(url);
  };

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
      minlength: [2, 'First name must be at least 2 characters long'],
      maxlength: [30, 'First name cannot exceed 30 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
      minlength: [1, 'Last name must be at least 1 character long'],
      maxlength: [30, 'Last name must be no more than 30 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email address in this format: name@example.com',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide your password'],
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
    userPictureUrl: {
      type: String,
      validate: [validateURL, 'Please provide a valid URL.'],
    },
    profileCoverPictureUrl: {
      type: String,
      validate: [validateURL, 'Please provide a valid URL.'],
    },
    userPictureUrl: {
      type: String,
      validate: [validateURL, 'Please provide a valid URL.'], 
    },
    profileCoverPictureUrl: {
        type: String,
        validate: [validateURL, 'Please provide a valid URL.'], 
    },
    watchList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
        ref: "Project"
      }
    ],
    searchingStatus: {
      type: String,
      enum: ['project', 'people'],
    },
    title: {
      type: String,
      maxlength: [100, 'The title cannot exceed 100 characters'],
    },
    about: {
      type: String,
      maxlength: [500, 'This section cannot exceed 500 characters'],
    },
    offer: {
      type: String,
      maxlength: [500, 'This section cannot exceed 500 characters'],
    },
    contacts: {
      linkedIn: { 
        type: String, 
        default: null,
        validate: [validateURL, 'Please provide a valid URL.'],
      },
      github: { 
        type: String, 
        default: null,
        validate: [validateURL, 'Please provide a valid URL.'],
      },
      portfolioWebsite: { 
        type: String, 
        default: null,
        validate: [validateURL, 'Please provide a valid URL.'],
      },
    },
    ownProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
    participatingProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
  },
  { timestamps: true }
);
// Hash the password before saving
UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

const UserModel = mongoose.model('User', UserSchema, 'Users');

module.exports = UserModel;

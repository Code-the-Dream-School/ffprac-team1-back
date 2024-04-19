const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const urlValidationPattern =
  /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/

const validateURL = (url) => {
  if (!url) { 
    return true;
  }
  return urlValidationPattern.test(url);
}

const UserSchema = new mongoose.Schema(
  {
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
        "Please provide a valid email address in this format: name@example.com"
      ]
    },
    password: {
      type: String,
      required: [true, "Please provide your password"],
      validate: {
        validator: function (password) {
          return password.length >= 6
        },
        message: "Password should be at least 6 characters long"
      }
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetTokenExpiry: {
      type: Date,
      default: null
    },
    profilePictureUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNzkzNDI4Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
      validate: [validateURL, "Please provide a valid URL."]
    },
    profilePicturePublicId: {
      type: String,
      default: 'default_profile_image'
    },
    profileCoverPictureUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY5OTYzNjc1Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
      validate: [validateURL, "Please provide a valid URL."]
    },
    profileCoverPicturePublicId: {
      type: String,
      default: 'default_profile_cover_image'
    },
    watchList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
      }
    ],
    searchingStatus: {
      type: String,
      enum: ["project", "people"]
    },
    title: {
      type: String,
      maxlength: [100, "The title cannot exceed 100 characters"]
    },
    about: {
      type: String,
      maxlength: [500, "This section cannot exceed 500 characters"]
    },
    offer: {
      type: String,
      maxlength: [500, "This section cannot exceed 500 characters"]
    },
    contacts: {
      linkedIn: {
        type: String,
        default: null,
        validate: [validateURL, "Please provide a valid URL."]
      },
      github: {
        type: String,
        default: null,
        validate: [validateURL, "Please provide a valid URL."]
      },
      portfolioWebsite: {
        type: String,
        default: null,
        validate: [validateURL, "Please provide a valid URL."]
      }
    },
    ownProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
      }
    ],
    participatingProjects: [{
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project"
        },
        role: {
          type: String,
          required: true,
          enum: [
              "Mentor",
              "Frontend Developer", 
              "Backend Developer", 
              "Fullstack Developer", 
              "Team Lead",
              "UI/UX Designer", 
              "Project Manager", 
              "DevOps Engineer", 
              "Quality Assurance Engineer"
          ]
        }
      }],
    appliedProjects: [{
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
      },
      role: {
        type: String,
        required: true,
        enum: [
            "Mentor",
            "Frontend Developer", 
            "Backend Developer", 
            "Fullstack Developer", 
            "Team Lead",
            "UI/UX Designer", 
            "Project Manager", 
            "DevOps Engineer", 
            "Quality Assurance Engineer"
        ]
      }
    }],
  },
  { timestamps: true }
)

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  const user = this
  if (!user.isModified("password")) return next()

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(user.password, salt)
  user.password = hash
  next()
})

const UserModel = mongoose.model("User", UserSchema, "Users")

module.exports = UserModel

const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 2,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6
  }
})

const UserModel = mongoose.model("User", UserSchema, "Users")

module.exports = UserModel

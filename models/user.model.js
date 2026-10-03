const mongoose = require("mongoose");
const validator = require("validator");
const userRoles = require("../util/userRoles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,

      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(userRoles),
      default: userRoles.USER,
    },

    avatar: {
      type: String,
      default: "/uploads/profile.jpeg",
    },
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.model("User", userSchema);

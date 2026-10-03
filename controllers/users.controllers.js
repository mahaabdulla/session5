const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../util/httpStatusText");
const User = require("../models/user.model");
const appError = require("../util/appError");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const generateJWT = require("../util/generate.JWT");

// =========================
// Get All Users
// =========================
const getAllUsers = asyncWrapper(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const users = await User.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      users,
    },
  });
});

// =========================
// Get User By ID
// =========================
const getUserById = asyncWrapper(async (req, res, next) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = appError.create("Invalid user id", 400, httpStatusText.FAIL);

    return next(error);
  }

  const user = await User.findById(userId, {
    __v: false,
    password: false,
  });

  if (!user) {
    const error = appError.create("User not found", 404, httpStatusText.FAIL);

    return next(error);
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
});

// =========================
// Register
// =========================
const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  console.log("req.file -> ", req.file);

  const normalizedEmail = email.trim().toLowerCase();

  const oldUser = await User.findOne({
    email: normalizedEmail,
  });

  if (oldUser) {
    const error = appError.create(
      "User already exists",
      409,
      httpStatusText.FAIL,
    );

    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    name,
    email: normalizedEmail,
    password: hashedPassword,
  };

  if (req.file) {
    userData.avatar = `/uploads/${req.file.filename}`;
  }

  const newUser = new User(userData);

  await newUser.save();

  const token = await generateJWT({
    userId: newUser._id,
    email: newUser.email,
    role: newUser.role,
  });

  newUser.password = undefined;

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: newUser,
      token,
    },
  });
});

// =========================
// Login
// =========================
const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = appError.create(
      "Email and password are required",
      400,
      httpStatusText.FAIL,
    );

    return next(error);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    const error = appError.create("User not found", 404, httpStatusText.FAIL);

    return next(error);
  }

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (!matchedPassword) {
    const error = appError.create("Invalid password", 401, httpStatusText.FAIL);

    return next(error);
  }

  const token = await generateJWT({
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  user.password = undefined;

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      token,
    },
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  register,
  login,
};

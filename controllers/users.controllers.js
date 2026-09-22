const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../util/httpStatusText");
const User = require("../models/user.model");
const appError = require("../util/appError");

const getAllUsers = asyncWrapper(async (req, res,  next) => {
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const users = await User.find({}, { __v: false }).limit(limit).skip(skip);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      users,
    },
  });
});

const getUserById = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id, { __v: false });
  if (!user) {
    const error = appError.
    create("User not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
});

const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  const oldUser = await User.findOne({
    email: normalizedEmail,
  });

  if (oldUser) {
    const error = appError.
    create("User already exists", 409, httpStatusText.FAIL);
    return next(error);   
  }

  const newUser = new User({
    name,
    email: normalizedEmail,
    password,
  });

  await newUser.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: newUser,
    },
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    const error = appError.
    create("User not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  if (user.password !== password) {
    const error = appError.
    create("Invalid password", 401, httpStatusText.FAIL);
    return next(error);
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  register,
  login,
};

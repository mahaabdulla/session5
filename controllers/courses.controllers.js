const { validationResult } = require("express-validator");
const Course = require("../models/course.model");
const httpStatusText = require("../util/httpStatusText.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const appError = require("../util/appError.js");

// =========================
// Get All Courses
// =========================
const getAllCourses = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      courses,
    },   
  });
});

// =========================
// Get Single Course
// =========================
const mongoose = require("mongoose");

const getCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const error = appError.create(
      "Invalid course id",
      400,
      httpStatusText.FAIL,
    );

    return next(error);
  }

  const course = await Course.findById(courseId);

  if (!course) {
    const error = appError.create("Course not found", 404, httpStatusText.FAIL);

    return next(error);
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      course,
    },
  });
});

// =========================
// Add Course
// =========================
const addCourse = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        errors: errors.array(),
      },
    });
  }

  const newCourse = new Course(req.body);

  await newCourse.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      course: newCourse,
    },
  });
});

// =========================
// Update Course
// =========================
const updateCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        errors: errors.array(),
      },
    });
  }

  const courseId = req.params.id;

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $set: req.body,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCourse) {
    const error = appError.create("Course not found", 404, httpStatusText.FAIL);

    return next(error);
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      course: updatedCourse,
    },
  });
});

// =========================
// Delete Course
// =========================
const deleteCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  const deletedCourse = await Course.findByIdAndDelete(courseId);

  if (!deletedCourse) {
    const error = appError.create("Course not found", 404, httpStatusText.FAIL);

    return next(error);
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

module.exports = {
  getAllCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};

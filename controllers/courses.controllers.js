const { validationResult } = require("express-validator");
const Course = require("../models/course.model");
const httpStatusText = require("../util/httpStatusText.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const appError = require("../util/appError.js");
const Review = require("../models/review.model");

// =========================
// Get All Courses
// =========================
const getAllCourses = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;
  const total = await Course.countDocuments();

  // Get courses with pagination
  const courses = await Course.find({}, { __v: false })
    .sort({ _id: 1 })
    .limit(limit)
    .skip(skip)
    .lean();

  // Calculate ratings for all courses
  const stats = await Review.aggregate([
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        reviewsCount: { $sum: 1 },
      },
    },
  ]);

  // Merge courses with their ratings
  const updatedCourses = courses.map((course) => {
    const courseStats = stats.find(
      (stat) => stat._id.toString() === course._id.toString(),
    );

    return {
      ...course,
      averageRating: courseStats
        ? Number(courseStats.averageRating.toFixed(2))
        : 0,
      reviewsCount: courseStats?.reviewsCount ?? 0,
    };
  });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      courses: updatedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// =========================
// Get Single Course
// =========================
const mongoose = require("mongoose");

const getCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  // 1. Validate Course ID
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(
      appError.create(
        "Invalid course id",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // 2. Check if course exists
  const course = await Course.findById(courseId, {
    __v: false,
  }).lean();

  if (!course) {
    return next(
      appError.create(
        "Course not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  // 3. Calculate course rating statistics
  const stats = await Review.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        reviewsCount: { $sum: 1 },
      },
    },
  ]);

  // 4. Merge course data with statistics
  const updatedCourse = {
    ...course,
    averageRating: stats[0]
      ? Number(stats[0].averageRating.toFixed(2))
      : 0,
    reviewsCount: stats[0]?.reviewsCount ?? 0,
  };

  // 5. Send response
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      course: updatedCourse,
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

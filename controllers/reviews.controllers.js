const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../util/httpStatusText");
const mongoose = require("mongoose");
const appError = require("../util/appError");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment");
const Review = require("../models/review.model");

const createReview = asyncWrapper(async (req, res, next) => {
  const { course, rating, comment } = req.body;
  const user = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(course)) {
    return next(appError.create("Invalid course id", 400, httpStatusText.FAIL));
  }

  const foundCourse = await Course.findById(course);

  if (!foundCourse) {
    return next(appError.create("Course not found", 404, httpStatusText.FAIL));
  }

  const enrollment = await Enrollment.findOne({
    user,
    course,
    status: "COMPLETED",
  });

  if (!enrollment) {
    return next(
      appError.create(
        "You must complete the course before leaving a review",
        403,
        httpStatusText.FAIL,
      ),
    );
  }

  const existingReview = await Review.findOne({
    user,
    course,
  });

  if (existingReview) {
    return next(
      appError.create(
        "You have already reviewed this course",
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  const review = new Review({
    user,
    course,
    rating,
    comment,
  });

  await review.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      review,
    },
  });
});

const getCourseReviews = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.courseId;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(appError.create("Invalid course id", 400, httpStatusText.FAIL));
  }

  const foundCourse = await Course.findById(courseId);

  if (!foundCourse) {
    return next(appError.create("Course not found", 404, httpStatusText.FAIL));
  }

  const reviews = await Review.find({
    course: courseId,
  }).populate("user", "name avatar");

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      reviews,
    },
  });
});

module.exports = {
  createReview,
  getCourseReviews,
};

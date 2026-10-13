const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../util/httpStatusText");
const mongoose = require("mongoose");
const appError = require("../util/appError");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment");
const Review = require("../models/review.model");

// =========================
// Create Review
// =========================
const createReview = asyncWrapper(async (req, res, next) => {
  const { course, rating, comment } = req.body;
  const user = req.user.userId;

  // Validate course ID
  if (!mongoose.Types.ObjectId.isValid(course)) {
    return next(
      appError.create("Invalid course id", 400, httpStatusText.FAIL)
    );
  }

  // Check if course exists
  const foundCourse = await Course.findById(course);

  if (!foundCourse) {
    return next(
      appError.create("Course not found", 404, httpStatusText.FAIL)
    );
  }

  // Check if user completed the course
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
        httpStatusText.FAIL
      )
    );
  }

  // Prevent duplicate reviews
  const existingReview = await Review.findOne({
    user,
    course,
  });

  if (existingReview) {
    return next(
      appError.create(
        "You have already reviewed this course",
        409,
        httpStatusText.FAIL
      )
    );
  }

  // Create review
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

// =========================
// Update Review
// =========================
const updateReview = asyncWrapper(async (req, res, next) => {
  const reviewId = req.params.id;
  const { rating, comment } = req.body;

  // Validate review ID
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(
      appError.create("Invalid review id", 400, httpStatusText.FAIL)
    );
  }

  // Check if at least one field is provided
  if (rating === undefined && comment === undefined) {
    return next(
      appError.create(
        "At least one field (rating or comment) must be provided",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Find review belonging to current user
  const review = await Review.findOne({
    _id: reviewId,
    user: req.user.userId,
  });

  if (!review) {
    return next(
      appError.create("Review not found", 404, httpStatusText.FAIL)
    );
  }

  // Update only provided fields
  if (rating !== undefined) {
    review.rating = rating;
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  // Save changes and run Mongoose validation
  await review.save();

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      review,
    },
  });
});

// =========================
// Get Course Reviews + Stats
// =========================
const getCourseReviews = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.courseId;

  // Validate course ID
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(
      appError.create("Invalid course id", 400, httpStatusText.FAIL)
    );
  }

  // Check if course exists
  const foundCourse = await Course.findById(courseId);

  if (!foundCourse) {
    return next(
      appError.create("Course not found", 404, httpStatusText.FAIL)
    );
  }

  // Calculate average rating and reviews count
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

  // Get all reviews for this course
  const reviews = await Review.find({
    course: courseId,
  }).populate("user", "name avatar");

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      reviews,
      stats: stats[0]
        ? {
            averageRating: Number(stats[0].averageRating.toFixed(2)),
            reviewsCount: stats[0].reviewsCount,
          }
        : {
            averageRating: 0,
            reviewsCount: 0,
          },
    },
  });
});

module.exports = {
  createReview,
  updateReview,
  getCourseReviews,
};

const mongoose = require("mongoose");

const Course = require("../models/course.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../util/httpStatusText");
const appError = require("../util/appError");

const {
  createReview: createReviewService,
  updateReviewById,
  getReviewsByCourse,
} = require("../services/review.service");

// =========================
// Create Review
// =========================
const createReview = asyncWrapper(async (req, res, next) => {
  const { course, rating, comment } = req.body;

  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(course)) {
    return next(
      appError.create(
        "Invalid course id",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const review = await createReviewService(userId, {
    course,
    rating,
    comment,
  });

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Review created successfully",
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

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(
      appError.create(
        "Invalid review id",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const updatedReview = await updateReviewById(
    reviewId,
    req.user.userId,
    req.body
  );

  if (!updatedReview) {
    return next(
      appError.create(
        "Review not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Review updated successfully",
    data: {
      review: updatedReview,
    },
  });
});

// =========================
// Get Course Reviews
// =========================
const getCourseReviews = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.courseId;

  const {
    page = 1,
    limit = 10,
  } = req.query;

  // Validate Course ID
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(
      appError.create(
        "Invalid course id",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Validate Pagination
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    return next(
      appError.create(
        "Invalid pagination parameters",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Check Course Existence
  const foundCourse = await Course.findById(courseId);

  if (!foundCourse) {
    return next(
      appError.create(
        "Course not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  // Only Published Courses
  if (foundCourse.status !== "PUBLISHED") {
    return next(
      appError.create(
        "Course not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  // Get Reviews From Service
  const result = await getReviewsByCourse(
    courseId,
    pageNumber,
    limitNumber
  );

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});

// =========================
// Exports
// =========================
module.exports = {
  createReview,
  updateReview,
  getCourseReviews,
};

const Review = require("../models/review.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment");
const mongoose = require("mongoose");
const appError = require("../util/appError");
const httpStatusText = require("../util/httpStatusText");

const getCoursesRatingStats = async (courseIds) => {
  if (courseIds.length === 0) {
    return [];
  }

  return Review.aggregate([
    {
      $match: {
        course: { $in: courseIds },
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
};

/// ===========

const createReview = async (userId, reviewData) => {
  const { course, rating, comment } = reviewData;

  const foundCourse = await Course.exists({
    _id: course,
  });

  if (!foundCourse) {
    throw appError.create("Course not found", 404, httpStatusText.FAIL);
  }

  const enrollment = await Enrollment.exists({
    user: userId,
    course,
    status: "COMPLETED",
  });

  if (!enrollment) {
    throw appError.create(
      "You must complete the course before leaving a review",
      403,
      httpStatusText.FAIL,
    );
  }

  const existingReview = await Review.exists({
    user: userId,
    course,
  });

  if (existingReview) {
    throw appError.create(
      "You have already reviewed this course",
      409,
      httpStatusText.FAIL,
    );
  }

  const review = await Review.create({
    user: userId,
    course,
    rating,
    comment,
  });

  return review;
};

// =========================
const updateReviewById = async (reviewId, userId, reviewData) => {
  const allowedData = {};

  if (reviewData.rating !== undefined) {
    allowedData.rating = reviewData.rating;
  }

  if (reviewData.comment !== undefined) {
    allowedData.comment = reviewData.comment;
  }

  if (Object.keys(allowedData).length === 0) {
    throw appError.create(
      "No valid fields to update",
      400,
      httpStatusText.FAIL,
    );
  }

  return await Review.findOneAndUpdate(
    {
      _id: reviewId,
      user: userId,
    },
    {
      $set: allowedData,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

/// =======
const attachRatingsToCourses = async (courses) => {
  if (courses.length === 0) {
    return [];
  }

  const courseIds = courses.map((course) => course._id);

  const stats = await getCoursesRatingStats(courseIds);

  const statsMap = new Map(stats.map((stat) => [stat._id.toString(), stat]));

  return courses.map((course) => {
    const courseStats = statsMap.get(course._id.toString());

    return {
      ...course,
      averageRating: courseStats
        ? Number(courseStats.averageRating.toFixed(2))
        : 0,
      reviewsCount: courseStats?.reviewsCount ?? 0,
    };
  });
};

// =========================
// Get Course Reviews
// =========================
const getReviewsByCourse = async (courseId, page, limit) => {
  const skip = (page - 1) * limit;

  const [reviews, total, stats] = await Promise.all([
    Review.find({ course: courseId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments({ course: courseId }),

    getCoursesRatingStats([new mongoose.Types.ObjectId(courseId)]),
  ]);

  return {
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
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getCoursesRatingStats,
  createReview,
  updateReviewById,
  attachRatingsToCourses,
  getReviewsByCourse,
};

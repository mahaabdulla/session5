const Review = require("../models/review.model");

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

const attachRatingsToCourses = async (courses) => {
  if (courses.length === 0) {
    return [];
  }

  const courseIds = courses.map((course) => course._id);

  const stats = await getCoursesRatingStats(courseIds);

  const statsMap = new Map(
    stats.map((stat) => [stat._id.toString(), stat])
  );

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

module.exports = {
  getCoursesRatingStats,
  attachRatingsToCourses,
};
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment");
const User = require("../models/user.model");
const userRoles = require("../util/userRoles");

const { attachRatingsToCourses } = require("./review.service");

const getCourses = async (query, sortQuery, skip, limit) => {
  const total = await Course.countDocuments(query);

  const courses = await Course.find(query, { __v: false })
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  const coursesWithRatings = await attachRatingsToCourses(courses);

  return {
    courses: coursesWithRatings,
    total,
  };
};

// =========================
// Get Course By ID
// =========================
const getCourseById = async (courseId, user) => {
  const course = await Course.findById(courseId, {
    __v: false,
  }).lean();

  if (!course) {
    return null;
  }

  if (course.status === "PUBLISHED") {
    const [courseWithRatings] = await attachRatingsToCourses([course]);
    return courseWithRatings;
  }

  if (!user?.userId) {
    return null;
  }

  const currentUser = await User.findById(user.userId).select("role");

  if (!currentUser) {
    return null;
  }

  if (currentUser.role === userRoles.ADMIN) {
    const [courseWithRatings] = await attachRatingsToCourses([course]);
    return courseWithRatings;
  }

  if (course.status !== "ARCHIVED") {
    return null;
  }

  const enrollment = await Enrollment.findOne({
    user: user.userId,
    course: courseId,
    status: { $in: ["ACTIVE", "COMPLETED"] },
  });

  if (!enrollment) {
    return null;
  }

  const [courseWithRatings] = await attachRatingsToCourses([course]);

  return courseWithRatings;
};

// =========================

const createCourse = async (courseData) => {
  const course = await Course.create(courseData);

  return course;
};

//====================
const updateCourseById = async (courseId, courseData) => {
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $set: courseData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedCourse;
};

// =========================
const archiveCourseById = async (courseId) => {
  return await Course.findByIdAndUpdate(
    courseId,
    { status: "ARCHIVED" },
    {
      new: true,
      runValidators: true,
    },
  );
};

// =========================
// Publish Course
// =========================
const publishCourseById = async (courseId) => {
  return await Course.findOneAndUpdate(
    {
      _id: courseId,
      status: "DRAFT",
    },
    {
      $set: { status: "PUBLISHED" },
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  archiveCourseById,
  publishCourseById,
};

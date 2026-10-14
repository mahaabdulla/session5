
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment");
const User = require("../models/user.model");
const userRoles = require("../util/userRoles");

const httpStatusText = require("../util/httpStatusText");
const appError = require("../util/appError");

const { attachRatingsToCourses } = require("./review.service");

// =========================
// Get All Courses
// =========================
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
  const course = await Course.findById(
    courseId,
    { __v: false }
  ).lean();

  if (!course) {
    return null;
  }

  // Public Course
  if (course.status === "PUBLISHED") {
    const [courseWithRatings] =
      await attachRatingsToCourses([course]);

    return courseWithRatings;
  }

  // Guest
  if (!user?.userId) {
    return null;
  }

  // Get Current User Role
  const currentUser = await User.findById(
    user.userId
  ).select("role");

  if (!currentUser) {
    return null;
  }

  // Admin Access
  if (currentUser.role === userRoles.ADMIN) {
    const [courseWithRatings] =
      await attachRatingsToCourses([course]);

    return courseWithRatings;
  }

  // Regular users cannot access drafts
  if (course.status !== "ARCHIVED") {
    return null;
  }

  // Check Valid Enrollment
  const enrollment = await Enrollment.findOne({
    user: user.userId,
    course: courseId,
    status: {
      $in: ["ACTIVE", "COMPLETED"],
    },
  });

  if (!enrollment) {
    return null;
  }

  const [courseWithRatings] =
    await attachRatingsToCourses([course]);

  return courseWithRatings;
};

// =========================
// Create Course
// =========================
const createCourse = async (courseData) => {
  const { title, price } = courseData;

  return await Course.create({
    title,
    price,
  });
};

// =========================
// Update Course By ID
// =========================
const updateCourseById = async (courseId, courseData) => {
  const allowedData = {};

  if (courseData.title !== undefined) {
    allowedData.title = courseData.title;
  }

  if (courseData.price !== undefined) {
    allowedData.price = courseData.price;
  }

  if (Object.keys(allowedData).length === 0) {
    throw appError.create(
      "No valid fields to update",
      400,
      httpStatusText.FAIL
    );
  }

  return await Course.findByIdAndUpdate(
    courseId,
    {
      $set: allowedData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =========================
// Archive Course
// =========================
const archiveCourseById = async (courseId) => {
  return await Course.findOneAndUpdate(
    {
      _id: courseId,
      status: "PUBLISHED",
    },
    {
      $set: {
        status: "ARCHIVED",
      },
    },
    {
      new: true,
      runValidators: true,
    }
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
      $set: {
        status: "PUBLISHED",
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =========================
// Exports
// =========================
module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  archiveCourseById,
  publishCourseById,
};

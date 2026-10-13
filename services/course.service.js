const Course = require("../models/course.model");

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

const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId, {
    __v: false,
  }).lean();

  if (!course) {
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
    }
  );
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  archiveCourseById,
};

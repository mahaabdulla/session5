
const mongoose = require("mongoose");

const Course = require("../models/course.model");
const httpStatusText = require("../util/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../util/appError");

const { buildCourseQuery } = require("../helpers/courseQuery.helper");

const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  archiveCourseById,
  publishCourseById,
} = require("../services/course.service");

// =========================
// Get All Courses
// =========================
const getAllCourses = asyncWrapper(async (req, res, next) => {
  const {
    search,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 10,
  } = req.query;

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

  const skip = (pageNumber - 1) * limitNumber;

  // Validate Search
  if (search !== undefined && typeof search !== "string") {
    return next(
      appError.create("Invalid search", 400, httpStatusText.FAIL)
    );
  }

  // Validate Minimum Price
  if (minPrice !== undefined) {
    const min = Number(minPrice);

    if (
      typeof minPrice !== "string" ||
      minPrice.trim() === "" ||
      !Number.isFinite(min) ||
      min < 0
    ) {
      return next(
        appError.create("Invalid minPrice", 400, httpStatusText.FAIL)
      );
    }
  }

  // Validate Maximum Price
  if (maxPrice !== undefined) {
    const max = Number(maxPrice);

    if (
      typeof maxPrice !== "string" ||
      maxPrice.trim() === "" ||
      !Number.isFinite(max) ||
      max < 0
    ) {
      return next(
        appError.create("Invalid maxPrice", 400, httpStatusText.FAIL)
      );
    }
  }

  // Validate Price Range
  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    return next(
      appError.create(
        "minPrice cannot be greater than maxPrice",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Build Search & Filtering Query
  const query = buildCourseQuery({
    search,
    minPrice,
    maxPrice,
  });

  // Show Published Courses Only
  query.status = "PUBLISHED";

  // Sorting Options
  const sortOptions = {
    newest: { _id: -1 },
    oldest: { _id: 1 },
    price_asc: { price: 1, _id: 1 },
    price_desc: { price: -1, _id: 1 },
    title_asc: { title: 1, _id: 1 },
  };

  if (
    typeof sort !== "string" ||
    !Object.hasOwn(sortOptions, sort)
  ) {
    return next(
      appError.create("Invalid sort option", 400, httpStatusText.FAIL)
    );
  }

  const sortQuery = sortOptions[sort];

  // Get Courses From Service
  const { courses, total } = await getCourses(
    query,
    sortQuery,
    skip,
    limitNumber
  );

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      courses,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    },
  });
});

// =========================
// Get Single Course
// =========================
const getCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(
      appError.create("Invalid course id", 400, httpStatusText.FAIL)
    );
  }

  const course = await getCourseById(courseId, req.user);

  if (!course) {
    return next(
      appError.create("Course not found", 404, httpStatusText.FAIL)
    );
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
  // Prevent setting status during creation
  const { title, price } = req.body;

  const newCourse = await createCourse({
    title,
    price,
  });

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Course created successfully",
    data: {
      course: newCourse,
    },
  });
});

// =========================
// Update Course
// =========================
const updateCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(
      appError.create("Invalid course id", 400, httpStatusText.FAIL)
    );
  }

  // Allow updating title and price only
  const { title, price } = req.body;
  const courseData = {};

  if (title !== undefined) {
    courseData.title = title;
  }

  if (price !== undefined) {
    courseData.price = price;
  }

  if (Object.keys(courseData).length === 0) {
    return next(
      appError.create(
        "At least one of title or price must be provided",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const updatedCourse = await updateCourseById(
    courseId,
    courseData
  );

  if (!updatedCourse) {
    return next(
      appError.create("Course not found", 404, httpStatusText.FAIL)
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course updated successfully",
    data: {
      course: updatedCourse,
    },
  });
});

// =========================
// Archive Course
// =========================
const archiveCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(
      appError.create("Invalid course id", 400, httpStatusText.FAIL)
    );
  }

  const archivedCourse = await archiveCourseById(courseId);

  if (!archivedCourse) {
    return next(
      appError.create("Course not found", 404, httpStatusText.FAIL)
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course archived successfully",
    data: {
      course: archivedCourse,
    },
  });
});

// =========================
// Publish Course
// =========================
const publishCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  // Validate Course ID
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(
      appError.create("Invalid course id", 400, httpStatusText.FAIL)
    );
  }

  // Publish Draft Course
  const publishedCourse = await publishCourseById(courseId);

  if (!publishedCourse) {
    const existingCourse = await Course.exists({
      _id: courseId,
    });

    if (!existingCourse) {
      return next(
        appError.create("Course not found", 404, httpStatusText.FAIL)
      );
    }

    return next(
      appError.create(
        "Only draft courses can be published",
        409,
        httpStatusText.FAIL
      )
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course published successfully",
    data: {
      course: publishedCourse,
    },
  });
});

// =========================
// Exports
// =========================
module.exports = {
  getAllCourses,
  getCourse,
  addCourse,
  updateCourse,
  archiveCourse,
  publishCourse,
};

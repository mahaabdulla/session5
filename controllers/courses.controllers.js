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
  deleteCourseById,
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
        httpStatusText.FAIL,
      ),
    );
  }

  const skip = (pageNumber - 1) * limitNumber;

  if (search !== undefined && typeof search !== "string") {
    return next(appError.create("Invalid search", 400, httpStatusText.FAIL));
  }

  if (minPrice !== undefined) {
    const min = Number(minPrice);

    if (
      typeof minPrice !== "string" ||
      minPrice.trim() === "" ||
      !Number.isFinite(min) ||
      min < 0
    ) {
      return next(
        appError.create("Invalid minPrice", 400, httpStatusText.FAIL),
      );
    }
  }

  if (maxPrice !== undefined) {
    const max = Number(maxPrice);

    if (
      typeof maxPrice !== "string" ||
      maxPrice.trim() === "" ||
      !Number.isFinite(max) ||
      max < 0
    ) {
      return next(
        appError.create("Invalid maxPrice", 400, httpStatusText.FAIL),
      );
    }
  }

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    return next(
      appError.create(
        "minPrice cannot be greater than maxPrice",
        400,
        httpStatusText.FAIL,
      ),
    );
  }

  const query = buildCourseQuery({
    search,
    minPrice,
    maxPrice,
  });

  const sortOptions = {
    newest: { _id: -1 },
    oldest: { _id: 1 },
    price_asc: { price: 1, _id: 1 },
    price_desc: { price: -1, _id: 1 },
    title_asc: { title: 1, _id: 1 },
  };

  if (typeof sort !== "string" || !Object.hasOwn(sortOptions, sort)) {
    return next(
      appError.create("Invalid sort option", 400, httpStatusText.FAIL),
    );
  }

  const sortQuery = sortOptions[sort];

  const { courses, total } = await getCourses(
    query,
    sortQuery,
    skip,
    limitNumber,
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
    return next(appError.create("Invalid course id", 400, httpStatusText.FAIL));
  }

  const course = await getCourseById(courseId);

  if (!course) {
    return next(appError.create("Course not found", 404, httpStatusText.FAIL));
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
  const newCourse = await createCourse(req.body);

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

  const updatedCourse = await updateCourseById(courseId, req.body);

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
// Delete Course
// =========================
const deleteCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(appError.create("Invalid course id", 400, httpStatusText.FAIL));
  }

  const deletedCourse = await deleteCourseById(courseId);

  if (!deletedCourse) {
    return next(appError.create("Course not found", 404, httpStatusText.FAIL));
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Course deleted successfully",
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

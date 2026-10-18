
const mongoose = require("mongoose");

const Enrollment = require("../models/enrollment");
const Course = require("../models/course.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../util/httpStatusText");
const appError = require("../util/appError");

const {
  changeEnrollmentStatus,
  cancelEnrollmentById,
} = require("../services/enrollment.service");

// =========================
// Create Enrollment
// =========================
const createEnrollment = asyncWrapper(async (req, res, next) => {
  const { course } = req.body;
  const user = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(course)) {
    return next(
      appError.create("Invalid course id", 400, httpStatusText.FAIL)
    );
  }

  const foundCourse = await Course.findById(course);

  if (!foundCourse) {
    return next(
      appError.create("Course not found", 404, httpStatusText.FAIL)
    );
  }

  const existingEnrollment = await Enrollment.findOne({
    user,
    course,
  });

  if (existingEnrollment) {
    return next(
      appError.create(
        "You are already enrolled in this course",
        409,
        httpStatusText.FAIL
      )
    );
  }

  if (foundCourse.status !== "PUBLISHED") {
    return next(
      appError.create(
        "Enrollment is only allowed for published courses",
        403,
        httpStatusText.FAIL
      )
    );
  }

  const enrollment = await Enrollment.create({
    user,
    course,
  });

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Enrollment created successfully",
    data: {
      enrollment,
    },
  });
});

// =========================
// Get My Enrollments
// =========================
const getMyEnrollments = asyncWrapper(async (req, res) => {
  const enrollments = await Enrollment.find({
    user: req.user.userId,
  })
    .populate("course", "title price status")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollments,
    },
  });
});

// =========================
// Get All Enrollments
// =========================
const getAllEnrollments = asyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

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

  const total = await Enrollment.countDocuments();

  const enrollments = await Enrollment.find()
    .populate("user", "name email role avatar")
    .populate("course", "title price status")
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limitNumber);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollments,
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
// Get Enrollment By ID
// =========================
const getEnrollmentById = asyncWrapper(async (req, res, next) => {
  const enrollmentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return next(
      appError.create(
        "Invalid enrollment id",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    user: req.user.userId,
  }).populate("course", "title price status");

  if (!enrollment) {
    return next(
      appError.create(
        "Enrollment not found",
        404,
        httpStatusText.FAIL
      )
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollment,
    },
  });
});

// =========================
// Cancel Enrollment
// =========================
const cancelEnrollment = asyncWrapper(async (req, res, next) => {
  const enrollmentId = req.params.id;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return next(
      appError.create(
        "Invalid enrollment id",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const enrollment = await cancelEnrollmentById(
    enrollmentId,
    userId
  );

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Enrollment cancelled successfully",
    data: {
      enrollment,
    },
  });
});

// =========================
// Update Enrollment Status
// ADMIN / MANAGER
// =========================
const updateEnrollmentStatus = asyncWrapper(async (req, res, next) => {
  const enrollmentId = req.params.id;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return next(
      appError.create(
        "Invalid enrollment id",
        400,
        httpStatusText.FAIL
      )
    );
  }

  if (!["COMPLETED", "CANCELLED"].includes(status)) {
    return next(
      appError.create(
        "Invalid enrollment status",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const enrollment = await changeEnrollmentStatus(
    enrollmentId,
    status
  );

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Enrollment status updated successfully",
    data: {
      enrollment,
    },
  });
});

// =========================
// Exports
// =========================
module.exports = {
  createEnrollment,
  getMyEnrollments,
  getAllEnrollments,
  getEnrollmentById,
  cancelEnrollment,
  updateEnrollmentStatus,
};

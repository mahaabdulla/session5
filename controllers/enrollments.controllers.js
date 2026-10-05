const Enrollment = require("../models/enrollment");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../util/httpStatusText");
const mongoose = require("mongoose");
const appError = require("../util/appError");
const Course = require("../models/course.model");

const createEnrollment = asyncWrapper(async (req, res, next) => {
  const { course } = req.body;

  if (!mongoose.Types.ObjectId.isValid(course)) {
    return next(appError.create("Invalid course id", 400, httpStatusText.FAIL));
  }

  const foundCourse = await Course.findById(course);

  if (!foundCourse) {
    return next(appError.create("Course not found", 404, httpStatusText.FAIL));
  }

  const existingEnrollment = await Enrollment.findOne({
    user: req.user.userId,
    course,
  });

  if (existingEnrollment) {
    return next(
      appError.create(
        "You are already enrolled in this course",
        409,
        httpStatusText.FAIL,
      ),
    );
  }

  const enrollment = new Enrollment({
    user: req.user.userId,
    course,
  });

  await enrollment.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollment,
    },
  });
});
// Get my enrollments

const getMyEnrollments = asyncWrapper(async (req, res) => {
  const enrollments = await Enrollment.find({
    user: req.user.userId,
  }).populate("course");

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollments,
    },
  });
});

// Get all enrollments
const getAllEnrollments = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const total = await Enrollment.countDocuments();

  const enrollments = await Enrollment.find()
    .populate("user", "name email role avatar")
    .populate("course", "title price")
    .limit(limit)
    .skip(skip);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Get enrollment by ID

const getEnrollmentById = asyncWrapper(async (req, res, next) => {
  const enrollmentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return next(
      appError.create("Invalid enrollment id", 400, httpStatusText.FAIL),
    );
  }

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    user: req.user.userId,
  });

  if (!enrollment) {
    return next(
      appError.create("Enrollment not found", 404, httpStatusText.FAIL),
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollment,
    },
  });
});

// delete enrollment by ID

const deleteEnrollment = asyncWrapper(async (req, res, next) => {
  const enrollmentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return next(
      appError.create("Invalid enrollment id", 400, httpStatusText.FAIL),
    );
  }

  const enrollment = await Enrollment.findOneAndDelete({
    _id: enrollmentId,
    user: req.user.userId,
  });

  if (!enrollment) {
    return next(
      appError.create("Enrollment not found", 404, httpStatusText.FAIL),
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

// UPDATE STATUS
const updateEnrollmentStatus = asyncWrapper(async (req, res, next) => {
  const enrollmentId = req.params.id;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return next(
      appError.create("Invalid enrollment id", 400, httpStatusText.FAIL),
    );
  }

  const allowedStatuses = ["ACTIVE", "COMPLETED", "CANCELLED"];

  if (!allowedStatuses.includes(status)) {
    return next(
      appError.create("Invalid enrollment status", 400, httpStatusText.FAIL),
    );
  }

  const enrollment = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { status },
    { new: true },
  );

  if (!enrollment) {
    return next(
      appError.create("Enrollment not found", 404, httpStatusText.FAIL),
    );
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      enrollment,
    },
  });
});

module.exports = {
  createEnrollment,
  getMyEnrollments,
  getAllEnrollments,
  getEnrollmentById,
  deleteEnrollment,
  updateEnrollmentStatus,
};

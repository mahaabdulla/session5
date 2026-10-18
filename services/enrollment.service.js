const Enrollment = require("../models/enrollment");
const appError = require("../util/appError");
const httpStatusText = require("../util/httpStatusText");

// =========================
// Change Enrollment Status
// =========================
const changeEnrollmentStatus = async (
  enrollmentId,
  newStatus,
  userId = null,
) => {
  const allowedStatuses = ["COMPLETED", "CANCELLED"];

  if (!allowedStatuses.includes(newStatus)) {
    throw appError.create(
      "Invalid enrollment status transition",
      400,
      httpStatusText.FAIL,
    );
  }

  const filter = {
    _id: enrollmentId,
  };

  if (userId) {
    filter.user = userId;
  }

  const updatedEnrollment = await Enrollment.findOneAndUpdate(
    {
      ...filter,
      status: "ACTIVE",
    },
    {
      $set: {
        status: newStatus,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (updatedEnrollment) {
    return updatedEnrollment;
  }

  const existingEnrollment = await Enrollment.findOne(filter);

  if (!existingEnrollment) {
    throw appError.create("Enrollment not found", 404, httpStatusText.FAIL);
  }

  throw appError.create(
    "Enrollment status transition is not allowed",
    409,
    httpStatusText.FAIL,
  );
};

const cancelEnrollmentById = async (enrollmentId, userId) => {
  return changeEnrollmentStatus(enrollmentId, "CANCELLED", userId);
};

module.exports = {
  changeEnrollmentStatus,
  cancelEnrollmentById,
};

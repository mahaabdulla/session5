
const express = require("express");
const router = express.Router();

const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");
const verifyToken = require("../middleware/verifyToken");

const enrollmentsControllers = require(
  "../controllers/enrollments.controllers"
);

// =========================
// Create / Get All Enrollments
// =========================
router
  .route("/")
  .post(
    verifyToken,
    allowedTo(userRoles.USER),
    enrollmentsControllers.createEnrollment
  )
  .get(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    enrollmentsControllers.getAllEnrollments
  );

// =========================
// Get My Enrollments
// =========================
router.get(
  "/my-courses",
  verifyToken,
  allowedTo(userRoles.USER),
  enrollmentsControllers.getMyEnrollments
);

// =========================
// Cancel Enrollment
// =========================
router.patch(
  "/:id/cancel",
  verifyToken,
  allowedTo(userRoles.USER),
  enrollmentsControllers.cancelEnrollment
);

// =========================
// Update Enrollment Status
// =========================
router.patch(
  "/:id/status",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.MANAGER),
  enrollmentsControllers.updateEnrollmentStatus
);

// =========================
// Get Enrollment By ID
// =========================
router.get(
  "/:id",
  verifyToken,
  allowedTo(userRoles.USER),
  enrollmentsControllers.getEnrollmentById
);

module.exports = router;

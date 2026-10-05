const express = require("express");
const router = express.Router();
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");
const enrollmentsControllers = require("../controllers/enrollments.controllers");
const verifyToken = require("../middleware/verifyToken");

router
  .route("/")
  .post(verifyToken, enrollmentsControllers.createEnrollment)
  .get(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    enrollmentsControllers.getAllEnrollments,
  );

router
  .route("/my-courses")
  .get(verifyToken, enrollmentsControllers.getMyEnrollments);

router
  .route("/:id")
  .get(verifyToken, enrollmentsControllers.getEnrollmentById)
  .delete(verifyToken, enrollmentsControllers.deleteEnrollment);

router
  .route("/:id/status")
  .patch(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    enrollmentsControllers.updateEnrollmentStatus,
  );

module.exports = router;

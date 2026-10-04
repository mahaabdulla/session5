const express = require("express");
const router = express.Router();

const enrollmentsControllers = require("../controllers/enrollments.controllers");
const verifyToken = require("../middleware/verifyToken");

router
  .route("/")
  .post(verifyToken, enrollmentsControllers.createEnrollment)
  .get(verifyToken, enrollmentsControllers.getAllEnrollments);

router
  .route("/:id")
  .get(verifyToken, enrollmentsControllers.getEnrollmentById)
  // .put(verifyToken, enrollmentsControllers.updateEnrollment)
  .delete(verifyToken, enrollmentsControllers.deleteEnrollment);

module.exports = router;

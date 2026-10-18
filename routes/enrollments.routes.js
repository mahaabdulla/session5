
const express = require("express");
const router = express.Router();

const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");
const verifyToken = require("../middleware/verifyToken");

const enrollmentsControllers = require(
  "../controllers/enrollments.controllers"
);


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


router.get(
  "/my-courses",
  verifyToken,
  allowedTo(userRoles.USER),
  enrollmentsControllers.getMyEnrollments
);


router.patch(
  "/:id/cancel",
  verifyToken,
  allowedTo(userRoles.USER),
  enrollmentsControllers.cancelEnrollment
);


router.patch(
  "/:id/status",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.MANAGER),
  enrollmentsControllers.updateEnrollmentStatus
);


router.get(
  "/:id",
  verifyToken,
  allowedTo(userRoles.USER),
  enrollmentsControllers.getEnrollmentById
);

module.exports = router;

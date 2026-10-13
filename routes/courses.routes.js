const express = require("express");
const router = express.Router();

const controllers = require("../controllers/courses.controllers");
const reviewsControllers = require("../controllers/reviews.controllers");

const optionalAuth = require("../middleware/optionalAuth");

const {
  createCourseValidation,
  updateCourseValidation,
} = require("../middleware/validations/course.validation");

const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");
const validateRequest = require("../middleware/validationResult");

router
  .route("/")
  .get(controllers.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    createCourseValidation(),
    validateRequest,
    controllers.addCourse,
  );

// =========================

router.get("/:courseId/reviews", reviewsControllers.getCourseReviews);

// =========================

router.patch(
  "/:id/archive",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.MANAGER),
  controllers.archiveCourse,
);

// =========================

router
  .route("/:id")
  .get(controllers.getCourse)
  .patch(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    updateCourseValidation(),
    validateRequest,
    controllers.updateCourse,
  );

module.exports = router;

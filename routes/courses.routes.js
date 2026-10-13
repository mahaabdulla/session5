
const express = require("express");
const router = express.Router();

const controllers = require("../controllers/courses.controllers");
const reviewsControllers = require("../controllers/reviews.controllers");

const {
  createCourseValidation,
  updateCourseValidation,
} = require("../middleware/validations/course.validation");

const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");
const validateRequest = require("../middleware/validationResult");

// Get all courses + Create course
router
  .route("/")
  .get(controllers.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    createCourseValidation(),
    validateRequest,
    controllers.addCourse
  );

// Get reviews for a specific course
router.get(
  "/:courseId/reviews",
  reviewsControllers.getCourseReviews
);

// Get, Update, Delete course
router
  .route("/:id")
  .get(controllers.getCourse)
  .patch(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    updateCourseValidation(),
    validateRequest,
    controllers.updateCourse
  )
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    controllers.deleteCourse
  );

module.exports = router;
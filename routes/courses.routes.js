const express = require("express");
const router = express.Router();

const controllers = require("../controllers/courses.controllers");
const {
  createCourseValidation,
  updateCourseValidation,
} = require("../middleware/validations/course.validation");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");

router
  .route("/")
  .get(controllers.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    createCourseValidation(),
    controllers.addCourse,
  );

router
  .route("/:id")
  .get(controllers.getCourse)
  .patch(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    updateCourseValidation(),
    controllers.updateCourse,
  )
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    controllers.deleteCourse,
  );

module.exports = router;

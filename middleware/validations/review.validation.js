const validateRequest = require("../middleware/validationResult");

const { body } = require("express-validator");

const createReviewValidation = [
  body("course")
    .notEmpty()
    .withMessage("Course is required")
    .isMongoId()
    .withMessage("Invalid course id"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment").notEmpty().withMessage("Comment is required"),
];

module.exports = {
  createReviewValidation,
};

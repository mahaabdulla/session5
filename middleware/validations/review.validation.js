const { body } = require("express-validator");

// =========================
// Create Review Validation
// =========================
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

  body("comment")
    .notEmpty()
    .withMessage("Comment is required")
    .isLength({ min: 3 })
    .withMessage("Comment must be at least 3 characters"),
];

// =========================
// Update Review Validation
// =========================
const updateReviewValidation = () => {
  return [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("comment")
      .optional()
      .notEmpty()
      .withMessage("Comment cannot be empty")
      .isLength({ min: 3 })
      .withMessage("Comment must be at least 3 characters"),
  ];
};

module.exports = {
  createReviewValidation,
  updateReviewValidation,
};
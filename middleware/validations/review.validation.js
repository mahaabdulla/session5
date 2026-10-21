
const { body } = require("express-validator");


const validateRating = (isUpdate = false) => {
  let validator = body("rating");

  if (isUpdate) {
    validator = validator.optional();
  } else {
    validator = validator.exists()
      .withMessage("Rating is required");
  }

  return validator
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5")
    .bail()
    .toInt();
};

// =========================
// Comment Validation
// =========================
const validateComment = (isUpdate = false) => {
  let validator = body("comment");

  if (isUpdate) {
    validator = validator.optional();
  } else {
    validator = validator.exists()
      .withMessage("Comment is required");
  }

  return validator
    .isString()
    .withMessage("Comment must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage("Comment must be between 3 and 1000 characters");
};

// =========================
// Validate Allowed Fields
// =========================
const validateAllowedReviewFields = (isUpdate = false) => {
  const allowedFields = isUpdate
    ? ["rating", "comment"]
    : ["course", "rating", "comment"];

  return body().custom((value) => {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      throw new Error("Request body must be an object");
    }

    const invalidFields = Object.keys(value).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      throw new Error(
        `Fields not allowed: ${invalidFields.join(", ")}`
      );
    }

    if (
      isUpdate &&
      !Object.hasOwn(value, "rating") &&
      !Object.hasOwn(value, "comment")
    ) {
      throw new Error(
        "At least one of rating or comment must be provided"
      );
    }

    return true;
  });
};


const createReviewValidation = [
  validateAllowedReviewFields(),

  body("course")
    .exists()
    .withMessage("Course is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid course id"),

  validateRating(),
  validateComment(),
];

// =========================
// Update Review Validation
// =========================
const updateReviewValidation = () => {
  return [
    validateAllowedReviewFields(true),
    validateRating(true),
    validateComment(true),
  ];
};


module.exports = {
  createReviewValidation,
  updateReviewValidation,
};

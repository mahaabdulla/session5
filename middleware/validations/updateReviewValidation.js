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
const express = require("express");
const router = express.Router();

const controllers = require("../controllers/reviews.controllers");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validateRequest = require("../middleware/validationResult");
const userRoles = require("../util/userRoles");
const {
  createReviewValidation,
} = require("../middleware/validations/review.validation");

router
  .route("/")
  .post(
    verifyToken,
    allowedTo(userRoles.USER),
    createReviewValidation,
    validateRequest,
    controllers.createReview
  );
  
module.exports = router;

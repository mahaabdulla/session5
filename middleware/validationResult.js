const { validationResult } = require("express-validator");
const appError = require("../util/appError");
const httpStatusText = require("../util/httpStatusText");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = appError.create(
      errors.array()[0].msg,
      400,
      httpStatusText.FAIL
    );

    return next(error);
  }

  next();
};

module.exports = validateRequest;

const mongoose = require("mongoose");
const httpStatusText = require("../util/httpStatusText");

// =========================
// Global Error Handler
// =========================
const globalErrorHandler = (err, req, res, next) => {
  // Prevent responding twice
  if (res.headersSent) {
    return next(err);
  }

  console.error("Error:", err);

  let statusCode = err.statusCode || 500;
  let status = err.statusText || httpStatusText.ERROR;
  let message = err.message || "Internal Server Error";

  // =========================
  // Mongoose Validation Error
  // =========================
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    status = httpStatusText.FAIL;

    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // =========================
  // Invalid ObjectId / Cast Error
  // =========================
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    status = httpStatusText.FAIL;
    message = `Invalid value for ${err.path}`;
  }

  // =========================
  // MongoDB Duplicate Key Error
  // =========================
  else if (err.code === 11000) {
    statusCode = 409;
    status = httpStatusText.FAIL;
    message = "Duplicate value. Resource already exists";
  }

  // =========================
  // Unexpected Server Error
  // =========================
  if (statusCode >= 500) {
    status = httpStatusText.ERROR;

    // Do not expose internal errors in production
    if (process.env.NODE_ENV === "production") {
      message = "Internal Server Error";
    }
  }

  return res.status(statusCode).json({
    status,
    message,
    code: statusCode,
  });
};

module.exports = globalErrorHandler;

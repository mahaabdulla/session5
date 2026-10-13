const jwt = require("jsonwebtoken");
const appError = require("../util/appError");
const httpStatusText = require("../util/httpStatusText");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token: continue as guest
  if (!authHeader) {
    return next();
  }

  // Validate Bearer format
  const parts = authHeader.split(" ");

  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer" ||
    !parts[1]
  ) {
    return next(
      appError.create(
        "Invalid authorization format",
        401,
        httpStatusText.FAIL
      )
    );
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    req.user = decoded;

    next();
  } catch (error) {
    return next(
      appError.create(
        "Invalid or expired token",
        401,
        httpStatusText.FAIL
      )
    );
  }
};

module.exports = optionalAuth;
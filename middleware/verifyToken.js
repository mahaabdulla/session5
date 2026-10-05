const jwt = require("jsonwebtoken");
const httpStatusText = require("../util/httpStatusText");
const appError = require("../util/appError");

const verifyToken = (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];

  if (!authHeader) {
    const error = appError.create(
      "Token is required",
      401,
      httpStatusText.FAIL,
    );

    // GO TO ERROR HANDLER MIDDLEWARE
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = currentUser;

    next();
  } catch (err) {
    const error = appError.create("Invalid token", 401, httpStatusText.FAIL);

    return next(error);
  }
};

module.exports = verifyToken;

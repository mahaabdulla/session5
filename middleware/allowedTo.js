const appError = require("../util/appError");
const httpStatusText = require("../util/httpStatusText");

module.exports = (...roles) => {
  console.log("roles", roles);
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = appError.create(
        "User not authorized to access this route",
        401,
        httpStatusText.FAIL,
      );
      return next(error);
    }
    next();
  };
};

// لراوت الي موجود بس فيه انفالد داتا
module.exports = (asyncFn) => {
  return (req, res, next) => {
    asyncFn(req, res, next).catch((error) => {
      next(error);
    });
  };
};

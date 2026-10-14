
const { body } = require("express-validator");

// =========================
// Reusable Title Validation
// =========================
const validateTitle = (isUpdate = false) => {
  let validator = body("title");

  if (isUpdate) {
    validator = validator.optional();
  } else {
    validator = validator.exists()
      .withMessage("عنوان الكورس مطلوب");
  }

  return validator
    .isString()
    .withMessage("يجب أن يكون العنوان نصاً")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("عنوان الكورس لا يمكن أن يكون فارغاً")
    .bail()
    .isLength({ min: 3 })
    .withMessage("يجب أن يتكون العنوان من 3 أحرف على الأقل");
};

// =========================
// Reusable Price Validation
// =========================
const validatePrice = (isUpdate = false) => {
  let validator = body("price");

  if (isUpdate) {
    validator = validator.optional();
  } else {
    validator = validator.exists()
      .withMessage("السعر مطلوب");
  }

  return validator
    .isFloat({ min: 0 })
    .withMessage("يجب أن يكون السعر رقماً أكبر من أو يساوي صفر")
    .bail()
    .toFloat();
};

// =========================
// Create Course Validation
// =========================
const createCourseValidation = () => {
  return [
    validateTitle(),
    validatePrice(),
  ];
};

// =========================
// Update Course Validation
// =========================
const updateCourseValidation = () => {
  return [
    validateTitle(true),
    validatePrice(true),

    body().custom((value) => {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        return true;
      }

      const hasTitle = Object.hasOwn(value, "title");
      const hasPrice = Object.hasOwn(value, "price");

      if (!hasTitle && !hasPrice) {
        throw new Error(
          "يجب إرسال العنوان أو السعر على الأقل للتعديل"
        );
      }

      return true;
    }),
  ];
};

// =========================
// Validate Allowed Fields
// =========================
const validateAllowedCourseFields = () => {
  const allowedFields = ["title", "price"];

  return body().custom((value) => {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      throw new Error("Request body must be an object");
    }

    const receivedFields = Object.keys(value);

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      throw new Error(
        `Fields not allowed: ${invalidFields.join(", ")}`
      );
    }

    return true;
  });
};




module.exports = {
  createCourseValidation,
  updateCourseValidation,
  validateAllowedCourseFields,
};

const multer = require("multer");
const path = require("path");
const appError = require("../util/appError");
const httpStatusText = require("../util/httpStatusText");

// =========================
// Storage
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const fileName = `user-${Date.now()}${ext}`;

    cb(null, fileName);
  },
});

// =========================
// File Filter
// =========================
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed"), false);
//   }
// };

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];

  if (imageType === "image") {
    return cb(null, true);
  }

  return cb(
    appError.create(
      "File must be an image",
      400,
      httpStatusText.FAIL
    ),
    false
  );
};

// =========================
// Upload
// =========================
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;

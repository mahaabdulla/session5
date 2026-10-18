
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const httpStatusText = require("./util/httpStatusText");
const globalErrorHandler = require("./middleware/globalErrorHandler");

const coursesRouter = require("./routes/courses.routes");
const usersRouter = require("./routes/users.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");
const reviewsRouter = require("./routes/review.routes");

const app = express();

// =========================
// Global Middleware
// =========================
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// =========================
// Static Files
// =========================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =========================
// Health Check
// =========================
app.get("/", (req, res) => {
  return res.status(200).send("API is running 🚀");
});

// =========================
// API Routes
// =========================
app.use("/api/courses", coursesRouter);
app.use("/api/users", usersRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/reviews", reviewsRouter);

// =========================
// Not Found Middleware
// =========================
app.use((req, res) => {
  return res.status(404).json({
    status: httpStatusText.FAIL,
    message: `Can't find ${req.originalUrl} on this server!`,
    code: 404,
  });
});

// =========================
// Global Error Handler
// =========================
app.use(globalErrorHandler);

module.exports = app;

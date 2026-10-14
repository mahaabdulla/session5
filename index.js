
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const httpStatusText = require("./util/httpStatusText");
const globalErrorHandler = require("./middleware/globalErrorHandler");

const coursesRouter = require("./routes/courses.routes");
const usersRouter = require("./routes/users.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");
const reviewsRouter = require("./routes/review.routes");


const app = express();

const port = process.env.PORT || 3000;
const url = process.env.MONGO_URL;


app.use(cors());
app.use(morgan("dev"));
app.use(express.json());


app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);



mongoose
  .connect(url)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });


app.get("/", (req, res) => {
  res.send("API is running 🚀");
});


app.use("/api/courses", coursesRouter);
app.use("/api/users", usersRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/reviews", reviewsRouter);



// =========================


app.use((req, res) => {
  return res.status(404).json({
    status: httpStatusText.FAIL,
    message: `Can't find ${req.originalUrl} on this server!`,
    code: 404,
  });
});


app.use(globalErrorHandler);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

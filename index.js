require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const httpStatusText = require("./util/httpStatusText");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const port = process.env.PORT || 3000;
const url = process.env.MONGO_URL;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

mongoose
  .connect(url)
  .then(() => {
    console.log("***** connect Successfully****");
  })
  .catch((error) => {
    console.log("❌ db Error", error);
  });

const coursesRouter = require("./routes/courses.routes");
const usersRouter = require("./routes/users.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
 
app.use("/api/courses", coursesRouter);
app.use("/api/users", usersRouter);
app.use("/api/enrollments", enrollmentsRouter);

//defult route middleware   لراوت الي مو موجود
// global middleware for not found routes
app.use((req, res) => {
  res.status(404).json({
    status: httpStatusText.FAIL,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    status: err.statusText || httpStatusText.ERROR,
    message: err.message,
    code: statusCode,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

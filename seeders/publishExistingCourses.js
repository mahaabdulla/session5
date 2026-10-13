require("dotenv").config();

const mongoose = require("mongoose");
const Course = require("../models/course.model");

const publishExistingCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const result = await Course.updateMany(
      { status: { $exists: false } },
      { $set: { status: "PUBLISHED" } }
    );

    console.log(`Updated ${result.modifiedCount} courses`);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

publishExistingCourses();
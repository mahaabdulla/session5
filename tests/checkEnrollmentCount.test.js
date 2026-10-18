
require("dotenv").config();

const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment");

const USER_ID = "6ad45c856bf94286af8f7e9b";
const COURSE_ID = "6ad45ced6bf94286af8f7e9c";

const checkEnrollmentCount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const count = await Enrollment.countDocuments({
      user: USER_ID,
      course: COURSE_ID,
    });

    console.log("Enrollment count:", count);

    if (count === 1) {
      console.log("PASS: Exactly one enrollment exists");
    } else {
      console.log("FAIL: Unexpected enrollment count");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

checkEnrollmentCount();

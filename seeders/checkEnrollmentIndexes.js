require("dotenv").config();

const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment");

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const indexes = await Enrollment.collection.indexes();

    console.log("Enrollment Indexes:");
    console.log(JSON.stringify(indexes, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkIndexes();
require("dotenv").config();

const mongoose = require("mongoose");
const Review = require("../models/review.model");

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const indexes = await Review.collection.indexes();

    console.log("Review Indexes:");
    console.log(JSON.stringify(indexes, null, 2));

    const uniqueIndex = indexes.find(
      (index) =>
        index.unique === true &&
        index.key.user === 1 &&
        index.key.course === 1 &&
        Object.keys(index.key).length === 2
    );

    if (uniqueIndex) {
      console.log("PASS: Review Unique Index exists!");
    } else {
      console.log("FAIL: Review Unique Index not found!");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

checkIndexes();
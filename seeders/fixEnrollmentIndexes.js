
require("dotenv").config();

const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment");

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const indexes = await Enrollment.collection.indexes();

    const oldIndexes = [
      "userId_1_courseId_1",
      "user_1_courseId_1",
    ];

    for (const indexName of oldIndexes) {
      const exists = indexes.some(
        (index) => index.name === indexName
      );

      if (exists) {
        await Enrollment.collection.dropIndex(indexName);
        console.log(`Removed old index: ${indexName}`);
      }
    }

    const remainingIndexes =
      await Enrollment.collection.indexes();

    console.log("Remaining indexes:");
    console.log(JSON.stringify(remainingIndexes, null, 2));

  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

fixIndexes();

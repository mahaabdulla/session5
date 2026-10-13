require("dotenv").config();

const mongoose = require("mongoose");
const Course = require("../models/course.model");

// =========================
// Seed Courses
// =========================
const seedCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Database connected successfully");

    // Dummy Courses
    const courses = [
      { title: "JavaScript", price: 1500 },
      { title: "Flutter", price: 2000 },
      { title: "Node.js", price: 1800 },
      { title: "React", price: 1200 },
      { title: "MongoDB", price: 1600 },
    ];

    // Insert courses without duplication
    for (const course of courses) {
      await Course.updateOne(
        { title: course.title },
        { $setOnInsert: course },
        { upsert: true }
      );
    }

    console.log("Courses seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
};

// Run Seeder
seedCourses();
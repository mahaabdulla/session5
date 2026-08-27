const { validationResult } = require("express-validator");
const Course = require("../models/course.model");

const getAllCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};
const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json({ course });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid Course ID format", error: error.message });
  }
};

const addCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newCourse = new Course(req.body);
  await newCourse.save();
  res.status(201).json(newCourse);
};

const updateCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const courseId = req.params.id;
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: req.body },
      { new: true },
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "course not found" });
    }

    res.json(updatedCourse);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "invalid id", error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ error: "course no find" });
    }

    res.json({ message: "deleted success", deletedCourse });
  } catch (error) {
    return res.status(400).json({
      message: "invalid id ",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};

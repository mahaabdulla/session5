const { validationResult } = require('express-validator');
const { courses } = require('../data/courses');



const getAllCourses = (req, res) => {
    res.json(courses);
};


const getCourse = (req, res) => {
    console.log('===== {req.params} ====', req.params);
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);

};

const addCourse = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, price } = req.body;
    const newCourse = { id: courses.length + 1, title, price };
    courses.push(newCourse);
    res.status(201).json(newCourse);
};



const updateCourse = (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const courseId = parseInt(req.params.id);
    const course = courses.find(c => c.id === courseId);

    if (!course) {
        return res.status(404).json({ error: 'الكورس غير موجود' });
    }

    const { title, price } = req.body;


    if (title !== undefined) {
        course.title = title;
    }

    if (price !== undefined) {
        course.price = price;
    }
    res.json(course);
};




const deleteCourse = (req, res) => {
    const courseId = parseInt(req.params.id);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
        return res.status(404).json({ error: 'الكورس غير موجود' });
    }
    courses.splice(courseIndex, 1);
    res.json({ message: 'الكورس تم حذفه بنجاح' });
};

module.exports = {
    getAllCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
};
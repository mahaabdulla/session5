const express = require('express');
const router = express.Router();

const controllers = require('../controllers/courses.controllers');
const { validationSchema, updateValidationSchema } = require('../middleware/validationsSchema');


router.route('/')
    .get(controllers.getAllCourses)
    .post(validationSchema(), controllers.addCourse);

router.route('/:id')
    .get(controllers.getCourse)
    .patch(
        updateValidationSchema(),
        controllers.updateCourse)
    .delete(controllers.deleteCourse);




module.exports = router;
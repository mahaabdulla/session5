const { body } = require('express-validator');

const validationSchema = () => {
    return [
        body('title')
            .notEmpty().withMessage('عنوان الكورس مطلوب')
            .isLength({ min: 3 }).withMessage('يجب أن يتكون العنوان من 3 أحرف على الأقل'),

        body('price')
            .notEmpty().withMessage('السعر مطلوب')
            .isNumeric().withMessage('يجب أن يكون السعر رقماً صالحاً')
            .toInt()
    ]
}

const updateValidationSchema = () => {
    return [

        body('title')
            .optional()
            .isLength({ min: 3 }).withMessage('يجب أن يتكون العنوان من 3 أحرف على الأقل'),

        body('price')
            .optional()
            .isNumeric().withMessage('يجب أن يكون السعر رقماً صالحاً')
            .toInt()
    ]

}

module.exports = { validationSchema, updateValidationSchema };
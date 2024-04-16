const { body } = require('express-validator');

const projectCreationRules = () => [
    body('title')
        .isString().withMessage('Title must be a text')
        .isLength({ min: 3 }).withMessage('Title must be a least 3 characters long')
        .notEmpty().withMessage('Title is required'),
    body('description')
        .isString().withMessage('Description must be a text')
        .isLength({ min: 20 }).withMessage('Description must be a least 20 characters long')
        .notEmpty().withMessage('Description is required'),
];

const projectEditingRules = () => [
  body('title')
      .optional()
      .isString().withMessage('Title must be a text')
      .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),

  body('description')
      .optional()
      .isString().withMessage('Description must be a text')
      .isLength({ min: 20 }).withMessage('Description must be at least 20 characters long'),
];


module.exports = {
  projectCreationRules,
  projectEditingRules
};

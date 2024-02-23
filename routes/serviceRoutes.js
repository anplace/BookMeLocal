const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.listServices);
router.get('/:id', serviceController.showService);
router.get('/new', checkAuthenticated, serviceController.showNewServiceForm);
router.post(
  '/',
  [
    checkAuthenticated,
    body('name')
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters long'),
    body('price')
      .isDecimal({ min: 0.01 })
      .withMessage('Price must be a positive number'),
  ],
  serviceController.createService
);

module.exports = router;

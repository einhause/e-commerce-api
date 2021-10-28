const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/orderController');

const authenticateUser = require('../middleware/authentication');
const authorizeUser = require('../middleware/authorization');

router
  .route('/')
  .get(authenticateUser, authorizeUser('admin'), getAllOrders)
  .post(authenticateUser, createOrder);

router.route('/showAllOrders').get(authenticateUser, getCurrentUserOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;

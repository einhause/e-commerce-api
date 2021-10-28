const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController');
const express = require('express');

const router = express.Router();

const authenticateUser = require('../middleware/authentication');
const authorizeUser = require('../middleware/authorization');

router
  .route('/')
  .get(authenticateUser, authorizeUser('admin', 'owner'), getAllUsers);

router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').put(authenticateUser, updateUserPassword);

router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;

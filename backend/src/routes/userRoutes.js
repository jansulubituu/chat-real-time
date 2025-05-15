const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

// Get all users & update profile
router.route('/')
  .get(protect, getUsers)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUser);

// Get user by id
router.route('/:id').get(protect, getUserById);

// Update user status
router.route('/status').put(protect, updateUserStatus);

module.exports = router; 
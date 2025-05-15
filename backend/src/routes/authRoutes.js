const express = require('express');
const router = express.Router();
const { register, login, getUserProfile, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get user profile
router.get('/profile', protect, getUserProfile);

// Logout
router.post('/logout', protect, logout);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  searchUsers,
  searchMessages,
  searchConversations
} = require('../controllers/searchController');

// Search users
router.get('/users', protect, searchUsers);

// Search messages
router.get('/messages', protect, searchMessages);

// Search conversations
router.get('/conversations', protect, searchConversations);

module.exports = router; 
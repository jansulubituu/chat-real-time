const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/auth');

// Send new message
router.route('/').post(protect, sendMessage);

// Get messages from conversation
router.route('/:conversationId').get(protect, getMessages);

// Mark messages as read
router.route('/:conversationId/read').put(protect, markMessagesAsRead);

// Delete & Edit message
router.route('/:id')
  .delete(protect, deleteMessage)
  .put(protect, editMessage);

module.exports = router;
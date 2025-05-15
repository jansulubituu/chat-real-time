const express = require('express');
const router = express.Router();
const {
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  addParticipants,
  removeParticipant,
  deleteConversation,
} = require('../controllers/conversationController');
const { protect } = require('../middlewares/auth');

// Get all conversations & create new conversation
router.route('/')
  .get(protect, getConversations)
  .post(protect, createConversation);

// Get, update, delete conversation by ID
router.route('/:id')
  .get(protect, getConversationById)
  .put(protect, updateConversation)
  .delete(protect, deleteConversation);

// Add participants to conversation
router.route('/:id/participants')
  .put(protect, addParticipants);

// Remove participant from conversation
router.route('/:id/participants/:userId')
  .delete(protect, removeParticipant);

module.exports = router; 
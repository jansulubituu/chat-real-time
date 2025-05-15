const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const conversationRoutes = require('./conversationRoutes');
const messageRoutes = require('./messageRoutes');
const uploadRoutes = require('./uploadRoutes');
const searchRoutes = require('./searchRoutes');

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Conversation routes
router.use('/conversations', conversationRoutes);

// Message routes
router.use('/messages', messageRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Search routes
router.use('/search', searchRoutes);

module.exports = router; 
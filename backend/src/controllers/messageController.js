const { Message, Conversation } = require('../models');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, contentType = 'text', fileUrl = null } = req.body;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to send message to this conversation' });
    }
    
    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content,
      contentType,
      fileUrl,
      readBy: [req.user._id], // Message is read by sender
    });
    
    // Update conversation's updatedAt
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    // Populate message with sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('readBy', 'username avatar');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messages from a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access messages in this conversation' });
    }
    
    // Get page and limit from query, with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get messages with pagination
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('readBy', 'username avatar');
    
    // Count total messages for pagination
    const totalMessages = await Message.countDocuments({ conversationId });
    
    res.json({
      messages: messages.reverse(), // Return in ascending order
      page,
      pages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access messages in this conversation' });
    }
    
    // Find all unread messages not sent by the current user
    const result = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );
    
    res.json({ message: `Marked ${result.modifiedCount} messages as read` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await message.deleteOne();
    
    res.json({ message: 'Message removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }
    
    // Only text messages can be edited
    if (message.contentType !== 'text') {
      return res.status(400).json({ message: 'Only text messages can be edited' });
    }
    
    message.content = content;
    
    const updatedMessage = await message.save();
    
    // Populate the message
    const populatedMessage = await Message.findById(updatedMessage._id)
      .populate('sender', 'username avatar')
      .populate('readBy', 'username avatar');
    
    res.json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
}; 
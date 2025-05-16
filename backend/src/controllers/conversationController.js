const { Conversation, User } = require('../models');

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { name, participants, type } = req.body;
    
    // Validate participants
    if (!participants || participants.length < 1) {
      return res.status(400).json({ message: 'Please add at least one participant' });
    }
    
    // Make sure all participants exist
    const allParticipants = [req.user._id.toString(), ...participants];
    const uniqueParticipants = [...new Set(allParticipants)]; // Remove duplicates
    
    // Check if a direct conversation between these two users already exists
    if (type === 'direct' && uniqueParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: uniqueParticipants },
      });
      
      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }
    }
    
    // Create conversation
    const conversation = await Conversation.create({
      name: type === 'group' ? name : '',
      type,
      participants: uniqueParticipants,
    });
    
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username avatar status');
    
    res.status(201).json(populatedConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {


    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'username avatar status')
      .sort({ updatedAt: -1 });
    console.log(req.user._id); //  new ObjectId('682655310fe0680255cd04ce')
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username avatar status');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update conversation
// @route   PUT /api/conversations/:id
// @access  Private
const updateConversation = async (req, res) => {
  try {
    const { name } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this conversation' });
    }
    
    // Only group conversations can be updated
    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Only group conversations can be updated' });
    }
    
    conversation.name = name || conversation.name;
    
    const updatedConversation = await conversation.save();
    
    res.json(updatedConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add participants to conversation
// @route   PUT /api/conversations/:id/participants
// @access  Private
const addParticipants = async (req, res) => {
  try {
    const { participants } = req.body;
    
    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: 'Please provide participants' });
    }
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this conversation' });
    }
    
    // Only group conversations can add participants
    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Cannot add participants to a direct conversation' });
    }
    
    // Add participants
    participants.forEach(p => {
      if (!conversation.participants.includes(p)) {
        conversation.participants.push(p);
      }
    });
    
    await conversation.save();
    
    const updatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username avatar status');
    
    res.json(updatedConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove participant from conversation
// @route   DELETE /api/conversations/:id/participants/:userId
// @access  Private
const removeParticipant = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this conversation' });
    }
    
    // Only group conversations can remove participants
    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Cannot remove participants from a direct conversation' });
    }
    
    // Remove participant
    conversation.participants = conversation.participants.filter(
      p => p.toString() !== req.params.userId
    );
    
    await conversation.save();
    
    const updatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username avatar status');
    
    res.json(updatedConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }
    
    await conversation.deleteOne();
    
    res.json({ message: 'Conversation removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  addParticipants,
  removeParticipant,
  deleteConversation,
}; 
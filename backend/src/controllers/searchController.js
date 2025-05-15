const { User, Message, Conversation } = require('../models');

// @desc    Search users
// @route   GET /api/search/users
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Tìm kiếm người dùng theo username hoặc email
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Loại trừ người dùng hiện tại
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search messages
// @route   GET /api/search/messages
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { query, conversationId } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    let searchCriteria = {
      content: { $regex: query, $options: 'i' },
      contentType: 'text'
    };
    
    // Nếu có conversationId, chỉ tìm kiếm trong cuộc trò chuyện đó
    if (conversationId) {
      searchCriteria.conversationId = conversationId;
      
      // Xác thực người dùng có quyền truy cập cuộc trò chuyện này không
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation || !conversation.participants.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to access this conversation' });
      }
    } else {
      // Nếu không có conversationId, chỉ tìm kiếm tin nhắn trong các cuộc trò chuyện mà người dùng tham gia
      const userConversations = await Conversation.find({ participants: req.user._id });
      const conversationIds = userConversations.map(conv => conv._id);
      
      searchCriteria.conversationId = { $in: conversationIds };
    }
    
    // Tìm kiếm tin nhắn và populate thông tin
    const messages = await Message.find(searchCriteria)
      .populate('sender', 'username avatar')
      .populate('conversationId', 'name type participants')
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search conversations
// @route   GET /api/search/conversations
// @access  Private
const searchConversations = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Tìm người dùng theo query
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id }
    });
    
    const userIds = users.map(user => user._id);
    
    // Tìm cuộc trò chuyện dựa trên tên hoặc người tham gia
    const conversations = await Conversation.find({
      participants: req.user._id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { participants: { $in: userIds } }
      ]
    }).populate('participants', 'username avatar status');
    
    res.json(conversations);
  } catch (error) {
    console.error('Error searching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchUsers,
  searchMessages,
  searchConversations
}; 
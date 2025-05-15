const jwt = require('jsonwebtoken');
const { Message, Conversation, User } = require('../models');
const {
  addConnectedUser,
  removeConnectedUser,
  getConnectedUser,
  getAllConnectedUsers,
  updateUserStatus
} = require('../config/socket');

const socketHandler = (io) => {
  // Middleware xác thực token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
    
    // Thêm user vào danh sách connected users
    addConnectedUser(userId, socket.id);
    
    // Cập nhật trạng thái user thành online
    await updateUserStatus(userId, 'online');
    
    // Thông báo cho tất cả người dùng về người dùng mới online
    io.emit('user_status_changed', { userId, status: 'online' });
    
    // Tham gia vào các phòng chat của người dùng
    try {
      const conversations = await Conversation.find({ participants: userId });
      conversations.forEach(conversation => {
        socket.join(conversation._id.toString());
      });
    } catch (error) {
      console.error('Error joining conversation rooms:', error);
    }

    // XỬ LÝ SỰ KIỆN NGẮT KẾT NỐI
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
      
      // Xóa user khỏi danh sách connected users
      removeConnectedUser(userId);
      
      // Cập nhật trạng thái user thành offline
      await updateUserStatus(userId, 'offline');
      
      // Thông báo cho tất cả người dùng về người dùng offline
      io.emit('user_status_changed', { userId, status: 'offline' });
    });

    // XỬ LÝ SỰ KIỆN GỬI TIN NHẮN MỚI
    socket.on('send_message', async (messageData) => {
      try {
        const { conversationId, content, contentType, fileUrl } = messageData;
        
        // Xác thực người dùng có quyền gửi tin nhắn vào cuộc trò chuyện này không
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation || !conversation.participants.includes(userId)) {
          return socket.emit('error', { message: 'Not authorized to send message to this conversation' });
        }
        
        // Tạo tin nhắn mới
        const newMessage = await Message.create({
          conversationId,
          sender: userId,
          content,
          contentType: contentType || 'text',
          fileUrl: fileUrl || null,
          readBy: [userId] // Message is read by sender
        });
        
        // Cập nhật thời gian cập nhật của cuộc trò chuyện
        conversation.updatedAt = Date.now();
        await conversation.save();
        
        // Populate message với thông tin người gửi
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username avatar')
          .populate('readBy', 'username avatar');
        
        // Gửi tin nhắn tới tất cả thành viên trong cuộc trò chuyện
        io.to(conversationId).emit('new_message', populatedMessage);
        
        // Gửi thông báo cho các thành viên không online
        conversation.participants.forEach(participantId => {
          const participantSocketId = getConnectedUser(participantId.toString());
          
          // Nếu người dùng không phải người gửi và đang không online
          if (participantId.toString() !== userId && !participantSocketId) {
            // Tại đây có thể cài đặt push notification
            console.log(`Send notification to offline user: ${participantId}`);
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // XỬ LÝ SỰ KIỆN ĐANG NHẬP
    socket.on('typing', ({ conversationId, isTyping }) => {
      // Thông báo cho tất cả thành viên khác trong cuộc trò chuyện rằng người dùng này đang nhập
      socket.to(conversationId).emit('typing', { userId, conversationId, isTyping });
    });

    // XỬ LÝ SỰ KIỆN ĐÃ ĐỌC TIN NHẮN
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        // Xác thực người dùng có quyền đọc tin nhắn trong cuộc trò chuyện này không
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation || !conversation.participants.includes(userId)) {
          return socket.emit('error', { message: 'Not authorized to access this conversation' });
        }
        
        // Tìm tất cả tin nhắn chưa đọc không phải do người dùng này gửi
        const result = await Message.updateMany(
          {
            conversationId,
            sender: { $ne: userId },
            readBy: { $ne: userId }
          },
          {
            $addToSet: { readBy: userId }
          }
        );
        
        // Lấy danh sách tin nhắn đã cập nhật
        const updatedMessages = await Message.find({
          conversationId,
          readBy: userId
        }).select('_id');

        // Gửi sự kiện thông báo các tin nhắn đã được đọc
        io.to(conversationId).emit('messages_read', {
          conversationId,
          userId,
          messageIds: updatedMessages.map(msg => msg._id)
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Error marking messages as read' });
      }
    });

    // XỬ LÝ SỰ KIỆN TẠO CUỘC TRÒ CHUYỆN MỚI
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        // Xác thực người dùng có quyền tham gia cuộc trò chuyện này không
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation || !conversation.participants.includes(userId)) {
          return socket.emit('error', { message: 'Not authorized to join this conversation' });
        }
        
        // Tham gia vào phòng chat
        socket.join(conversationId);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Error joining conversation' });
      }
    });

    // XỬ LÝ SỰ KIỆN THOÁT KHỎI CUỘC TRÒ CHUYỆN
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(conversationId);
    });
  });
};

module.exports = socketHandler; 
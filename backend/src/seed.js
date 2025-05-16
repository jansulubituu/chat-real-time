const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Conversation, Message } = require('./models');
const connectDB = require('./config/db');
require('dotenv').config();

// Xóa tất cả dữ liệu hiện có
const clearDatabase = async () => {
  console.log('Đang xóa dữ liệu hiện có...');
  await Message.deleteMany({});
  await Conversation.deleteMany({});
  await User.deleteMany({});
  console.log('Đã xóa dữ liệu thành công!');
};

// Tạo người dùng mẫu
const createUsers = async () => {
  console.log('Đang tạo người dùng mẫu...');
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);
  
  const users = [
    {
      username: 'nguyen_van_a',
      email: 'nguyenvana@gmail.com',
      password: hashedPassword,
      avatar: 'https://res.cloudinary.com/demo/image/upload/v1693/avatars/avatar1.jpg',
      status: 'online'
    },
    {
      username: 'tran_thi_b',
      email: 'tranthib@gmail.com',
      password: hashedPassword,
      avatar: 'https://res.cloudinary.com/demo/image/upload/v1693/avatars/avatar2.jpg',
      status: 'offline'
    },
    {
      username: 'le_van_c',
      email: 'levanc@gmail.com',
      password: hashedPassword,
      avatar: 'https://res.cloudinary.com/demo/image/upload/v1693/avatars/avatar3.jpg',
      status: 'online'
    },
    {
      username: 'pham_thi_d',
      email: 'phamthid@gmail.com',
      password: hashedPassword,
      avatar: 'https://res.cloudinary.com/demo/image/upload/v1693/avatars/avatar4.jpg',
      status: 'offline'
    }
  ];
  
  const createdUsers = await User.insertMany(users);
  console.log(`Đã tạo ${createdUsers.length} người dùng!`);
  return createdUsers;
};

// Tạo các cuộc trò chuyện
const createConversations = async (users) => {
  console.log('Đang tạo cuộc trò chuyện...');
  
  // Tạo cuộc trò chuyện trực tiếp giữa người dùng 1 và 2
  const directConversation1 = new Conversation({
    type: 'direct',
    participants: [users[0]._id, users[1]._id]
  });
  
  // Tạo cuộc trò chuyện trực tiếp giữa người dùng 1 và 3
  const directConversation2 = new Conversation({
    type: 'direct',
    participants: [users[0]._id, users[2]._id]
  });
  
  // Tạo nhóm với tất cả người dùng
  const groupConversation = new Conversation({
    name: 'Nhóm thảo luận dự án',
    type: 'group',
    participants: users.map(user => user._id)
  });
  
  const conversations = [
    directConversation1,
    directConversation2,
    groupConversation
  ];
  
  const createdConversations = await Conversation.insertMany(conversations);
  console.log(`Đã tạo ${createdConversations.length} cuộc trò chuyện!`);
  return createdConversations;
};

// Tạo tin nhắn mẫu
const createMessages = async (users, conversations) => {
  console.log('Đang tạo tin nhắn mẫu...');
  
  const messages = [
    // Tin nhắn trong cuộc trò chuyện trực tiếp đầu tiên
    {
      conversationId: conversations[0]._id,
      sender: users[0]._id,
      content: 'Chào bạn! Bạn khỏe không?',
      contentType: 'text',
      readBy: [users[0]._id]
    },
    {
      conversationId: conversations[0]._id,
      sender: users[1]._id,
      content: 'Mình khỏe, cảm ơn bạn. Còn bạn thì sao?',
      contentType: 'text',
      readBy: [users[0]._id, users[1]._id]
    },
    {
      conversationId: conversations[0]._id,
      sender: users[0]._id,
      content: 'Mình cũng tốt, đang làm việc trên một dự án mới.',
      contentType: 'text',
      readBy: [users[0]._id]
    },
    
    // Tin nhắn trong cuộc trò chuyện trực tiếp thứ hai
    {
      conversationId: conversations[1]._id,
      sender: users[0]._id,
      content: 'Chào! Chúng ta có thể nói về dự án không?',
      contentType: 'text',
      readBy: [users[0]._id, users[2]._id]
    },
    {
      conversationId: conversations[1]._id,
      sender: users[2]._id,
      content: 'Được chứ, bạn cần gì?',
      contentType: 'text',
      readBy: [users[0]._id, users[2]._id]
    },
    
    // Tin nhắn trong cuộc trò chuyện nhóm
    {
      conversationId: conversations[2]._id,
      sender: users[0]._id,
      content: 'Chào mừng mọi người đến với nhóm!',
      contentType: 'text',
      readBy: [users[0]._id, users[1]._id, users[2]._id]
    },
    {
      conversationId: conversations[2]._id,
      sender: users[1]._id,
      content: 'Cảm ơn vì đã mời tôi tham gia.',
      contentType: 'text',
      readBy: [users[0]._id, users[1]._id, users[2]._id]
    },
    {
      conversationId: conversations[2]._id,
      sender: users[2]._id,
      content: 'Tôi rất vui được làm việc với tất cả các bạn.',
      contentType: 'text',
      readBy: [users[0]._id, users[1]._id, users[2]._id]
    },
    {
      conversationId: conversations[2]._id,
      sender: users[3]._id,
      content: 'Tôi cũng vậy, sẽ rất thú vị đây!',
      contentType: 'text',
      readBy: [users[0]._id, users[1]._id, users[2]._id, users[3]._id]
    }
  ];
  
  const createdMessages = await Message.insertMany(messages);
  console.log(`Đã tạo ${createdMessages.length} tin nhắn!`);
  return createdMessages;
};

// Hàm khởi tạo cơ sở dữ liệu
const initializeDatabase = async () => {
  try {
    // Kết nối với cơ sở dữ liệu
    await connectDB();
    
    // Xóa dữ liệu cũ
    await clearDatabase();
    
    // Tạo người dùng, cuộc trò chuyện và tin nhắn
    const users = await createUsers();
    const conversations = await createConversations(users);
    await createMessages(users, conversations);
    
    console.log('Khởi tạo cơ sở dữ liệu thành công!');
    
    // Hiển thị thông tin đăng nhập mẫu
    console.log('\nThông tin đăng nhập mẫu:');
    console.log('Email: nguyenvana@gmail.com');
    console.log('Mật khẩu: 123456');
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('Đã đóng kết nối cơ sở dữ liệu.');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

// Thực hiện khởi tạo
initializeDatabase(); 
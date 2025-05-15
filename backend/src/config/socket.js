const { Server } = require('socket.io');
const { User } = require('../models');

// Map to store active user sockets
const connectedUsers = new Map();

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Trong production, nên giới hạn origin cụ thể
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000 // 1 minute
  });

  return io;
};

// Get user ID from socket
const getUserId = (socket) => {
  return socket.userId;
};

// Add user to connected users map
const addConnectedUser = (userId, socketId) => {
  connectedUsers.set(userId, socketId);
};

// Remove user from connected users map
const removeConnectedUser = (userId) => {
  if (userId) {
    connectedUsers.delete(userId);
  }
};

// Get socket ID of connected user
const getConnectedUser = (userId) => {
  return connectedUsers.get(userId);
};

// Get all connected users
const getAllConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

// Update user status in database
const updateUserStatus = async (userId, status) => {
  try {
    await User.findByIdAndUpdate(userId, {
      status,
      lastActive: Date.now()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

module.exports = {
  configureSocket,
  getUserId,
  addConnectedUser,
  removeConnectedUser,
  getConnectedUser,
  getAllConnectedUsers,
  updateUserStatus
}; 
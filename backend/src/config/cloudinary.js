const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage cho hình ảnh
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-app-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Cấu hình storage cho file
const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-app-files',
    resource_type: 'raw',
    format: (req, file) => {
      // Lấy đuôi file từ tên gốc
      return file.originalname.split('.').pop();
    },
    public_id: (req, file) => {
      // Tạo tên file (không có đuôi)
      return file.originalname.split('.').slice(0, -1).join('.') + '_' + Date.now();
    }
  }
});

// Cấu hình middleware upload hình ảnh
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Cấu hình middleware upload file
const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadFile
};
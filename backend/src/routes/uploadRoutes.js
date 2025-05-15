const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { uploadImage, uploadFile, deleteFile } = require('../controllers/uploadController');
const { uploadImage: uploadImageMiddleware, uploadFile: uploadFileMiddleware } = require('../config/cloudinary');

// Upload image
router.post('/image', protect, uploadImageMiddleware.single('image'), uploadImage);

// Upload file
router.post('/file', protect, uploadFileMiddleware.single('file'), uploadFile);

// Delete file from cloudinary
router.delete('/:public_id', protect, deleteFile);

module.exports = router; 
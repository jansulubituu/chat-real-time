const { cloudinary } = require('../config/cloudinary');
const path = require('path');

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.status(200).json({
      url: req.file.path,
      filename: req.file.filename,
      contentType: 'image'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload file
// @route   POST /api/upload/file
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Lấy thông tin đuôi file
    const fileExtension = path.extname(req.file.originalname).substring(1);
    
    // Lấy MIME type từ file nếu có hoặc suy ra từ đuôi file
    let mimeType = req.file.mimetype || '';
    if (!mimeType) {
      // Suy ra mimetype dựa trên đuôi file (đơn giản)
      switch (fileExtension.toLowerCase()) {
        case 'pdf': mimeType = 'application/pdf'; break;
        case 'doc': case 'docx': mimeType = 'application/msword'; break;
        case 'xls': case 'xlsx': mimeType = 'application/vnd.ms-excel'; break;
        case 'ppt': case 'pptx': mimeType = 'application/vnd.ms-powerpoint'; break;
        case 'txt': mimeType = 'text/plain'; break;
        case 'zip': mimeType = 'application/zip'; break;
        case 'rar': mimeType = 'application/x-rar-compressed'; break;
        case 'mp3': mimeType = 'audio/mpeg'; break;
        case 'mp4': mimeType = 'video/mp4'; break;
        default: mimeType = 'application/octet-stream';
      }
    }

    res.status(200).json({
      url: req.file.path,
      filename: req.file.filename, 
      originalname: req.file.originalname,
      extension: fileExtension,
      mimeType: mimeType,
      contentType: 'file'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete file from cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const { public_id } = req.params;
    
    if (!public_id) {
      return res.status(400).json({ message: 'Public ID is required' });
    }
    
    // Xóa file từ Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete file' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadImage,
  uploadFile,
  deleteFile
}; 
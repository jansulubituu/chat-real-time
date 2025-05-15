const { cloudinary } = require('../config/cloudinary');

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

    res.status(200).json({
      url: req.file.path,
      filename: req.file.filename, 
      originalname: req.file.originalname,
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
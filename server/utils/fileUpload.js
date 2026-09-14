const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Uploads a file buffer either to Cloudinary or saves it locally as a fallback.
 * @param {Object} file - The multer file object (file.buffer, file.originalname, etc.)
 * @param {String} folder - Folder name in Cloudinary (e.g., 'notes', 'avatars')
 * @returns {Promise<Object>} Object containing secure_url and public_id
 */
// Helper to save buffer to local disk
const saveToLocalDisk = async (file) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
  const uniqueFilename = `${Date.now()}-${baseName}${ext}`;
  const targetPath = path.join(uploadsDir, uniqueFilename);

  await fs.promises.writeFile(targetPath, file.buffer);

  return {
    fileUrl: `/uploads/${uniqueFilename}`,
    publicId: uniqueFilename
  };
};

/**
 * Uploads a file buffer either to Cloudinary or saves it locally as a fallback.
 * @param {Object} file - The multer file object (file.buffer, file.originalname, etc.)
 * @param {String} folder - Folder name in Cloudinary (e.g., 'notes', 'avatars')
 * @returns {Promise<Object>} Object containing secure_url and public_id
 */
const uploadFile = async (file, folder = 'notes') => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      let resourceType = 'auto';
      
      // For documents (PDF, PPT, PPTX, DOC, DOCX), use 'raw' to prevent ImageMagick "Invalid PDF file" parsing errors
      if (['.pdf', '.ppt', '.pptx', '.doc', '.docx'].includes(ext)) {
        resourceType = 'raw';
      } else if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
        resourceType = 'image';
      }

      const safeBase = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
      const publicId = `${safeBase}-${Date.now()}${ext}`;

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: resourceType,
            public_id: publicId
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Stream Error:', error.message);
              reject(error);
            } else {
              resolve({
                fileUrl: result.secure_url,
                publicId: result.public_id
              });
            }
          }
        );
        uploadStream.end(file.buffer);
      });

      return uploadResult;
    } catch (cloudinaryErr) {
      console.warn('Cloudinary upload failed, falling back to local disk storage:', cloudinaryErr.message);
      return await saveToLocalDisk(file);
    }
  } else {
    // Local fallback: write buffer to server/uploads/
    return await saveToLocalDisk(file);
  }
};

/**
 * Deletes a file either from Cloudinary or local uploads folder.
 * @param {String} publicId - The Cloudinary publicId or local filename
 * @param {String} fileUrl - The url of the file (used to determine if it is local)
 */
const deleteFile = async (publicId, fileUrl) => {
  if (!publicId) return;

  if (isCloudinaryConfigured && fileUrl && !fileUrl.startsWith('/uploads/')) {
    try {
      // Determine if resource is raw
      const isRaw = fileUrl.endsWith('.ppt') || fileUrl.endsWith('.pptx');
      await cloudinary.uploader.destroy(publicId, { resource_type: isRaw ? 'raw' : 'image' });
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error.message);
    }
  } else {
    // Delete local file
    try {
      const localPath = path.join(__dirname, '../uploads', publicId);
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    } catch (error) {
      console.error('Failed to delete file locally:', error.message);
    }
  }
};

module.exports = {
  uploadFile,
  deleteFile
};

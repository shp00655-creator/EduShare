const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  getUserProfile, 
  updateUserProfile,
  changePassword,
  reportUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', authUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateUserProfile);
router.put('/password', protect, changePassword);
router.post('/report-user', protect, reportUser);

module.exports = router;

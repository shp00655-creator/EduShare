const User = require('../models/User');
const Report = require('../models/Report');
const jwt = require('jsonwebtoken');
const { uploadFile, deleteFile } = require('../utils/fileUpload');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_session_jwt_token_for_industrial_notes_app', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, rollNumber, branch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let profilePictureUrl = "";
    let profilePicturePublicId = "";

    // If an avatar is uploaded
    if (req.file) {
      const uploadResult = await uploadFile(req.file, 'avatars');
      if (uploadResult) {
        profilePictureUrl = uploadResult.fileUrl;
        profilePicturePublicId = uploadResult.publicId;
      }
    }

    const resolvedRole = (email && (email.toLowerCase().startsWith('admin@') || email.toLowerCase() === 'pawan@gmail.com')) ? 'admin' : 'user';

    // Create user (password hashing is handled in User Schema pre-save)
    const user = await User.create({
      name,
      email,
      password,
      rollNumber,
      branch,
      semester,
      profilePicture: profilePictureUrl,
      profilePicturePublicId: profilePicturePublicId,
      credits: 0, // Initialize at 0
      role: resolvedRole
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        branch: user.branch,
        semester: user.semester,
        profilePicture: user.profilePicture,
        credits: user.credits,
        bookmarks: user.bookmarks,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email }).populate('bookmarks');
    
    if (user && user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned by an administrator.' });
    }

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        branch: user.branch,
        semester: user.semester,
        profilePicture: user.profilePicture,
        credits: user.credits,
        bookmarks: user.bookmarks,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        branch: user.branch,
        semester: user.semester,
        profilePicture: user.profilePicture,
        credits: user.credits,
        bookmarks: user.bookmarks,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profile', error: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.rollNumber = req.body.rollNumber !== undefined ? req.body.rollNumber : user.rollNumber;
      user.branch = req.body.branch !== undefined ? req.body.branch : user.branch;
      user.semester = req.body.semester !== undefined ? req.body.semester : user.semester;

      if (req.file) {
        // If user already had a profile picture, delete it from storage
        if (user.profilePicturePublicId) {
          await deleteFile(user.profilePicturePublicId, user.profilePicture);
        }

        // Upload new picture
        const uploadResult = await uploadFile(req.file, 'avatars');
        if (uploadResult) {
          user.profilePicture = uploadResult.fileUrl;
          user.profilePicturePublicId = uploadResult.publicId;
        }
      }

      const updatedUser = await user.save();
      const populatedUser = await User.findById(updatedUser._id).populate('bookmarks');

      res.json({
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        rollNumber: populatedUser.rollNumber,
        branch: populatedUser.branch,
        semester: populatedUser.semester,
        profilePicture: populatedUser.profilePicture,
        credits: populatedUser.credits,
        bookmarks: populatedUser.bookmarks,
        role: populatedUser.role,
        token: generateToken(populatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide old password and new password' });
    }

    const user = await User.findById(req.user._id);

    if (user && (await user.comparePassword(oldPassword))) {
      user.password = newPassword; // Pre-save hook will hash it
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(400).json({ message: 'Invalid old password' });
    }
  } catch (error) {
    console.error('Change Password Error:', error.message);
    res.status(500).json({ message: 'Server error changing password', error: error.message });
  }
};

/**
 * @desc    Report a user
 * @route   POST /api/auth/report-user
 * @access  Private
 */
const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reportedNoteId, reason } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'Please provide reported user and reason.' });
    }

    // Check if reporting self
    if (reportedUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself.' });
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'User to report not found.' });
    }

    const reportData = {
      reportedUser: reportedUserId,
      reportedBy: req.user._id,
      reason: reason.trim()
    };

    if (reportedNoteId) {
      reportData.reportedNote = reportedNoteId;
    }

    const report = await Report.create(reportData);

    res.status(201).json({ message: 'Report submitted successfully. Administrators will review it.', report });
  } catch (error) {
    console.error('Report User Error:', error.message);
    res.status(500).json({ message: 'Server error submitting report', error: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  reportUser
};

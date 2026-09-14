const express = require('express');
const router = express.Router();
const {
  uploadNote,
  getNotes,
  getNoteById,
  trackDownload,
  toggleBookmark,
  rateNote,
  addComment,
  editComment,
  deleteComment,
  addReply,
  deleteReply,
  deleteNote,
  getUserStats,
  getLeaderboard,
  downloadNoteFile
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Note: Ensure specific routes like /user/stats and /leaderboard are registered BEFORE dynamic /:id routes
// to prevent Express from matching 'user' or 'leaderboard' as an ':id' parameter.

// Dashboard and Leaderboard statistics
router.get('/user/stats', protect, getUserStats);
router.get('/leaderboard', getLeaderboard);

// Direct file download route (must be before :id to ensure match logic is clean, though it has extra segment /download-file so it won't conflict anyway)
router.get('/:id/download-file', protect, downloadNoteFile);

// Core CRUD routes
router.route('/')
  .get(getNotes)
  .post(protect, upload.single('file'), uploadNote);

router.route('/:id')
  .get(getNoteById)
  .delete(protect, deleteNote);

// Interaction routes
router.post('/:id/download', protect, trackDownload);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/rate', protect, rateNote);

// Comments routes
router.post('/:id/comments', protect, addComment);
router.route('/:id/comments/:commentId')
  .put(protect, editComment)
  .delete(protect, deleteComment);

// Reply routes
router.post('/:id/comments/:commentId/replies', protect, addReply);
router.delete('/:id/comments/:commentId/replies/:replyId', protect, deleteReply);

module.exports = router;

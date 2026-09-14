const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Public route to view subjects (used for drop-downs / auto-fills)
router.get('/', getSubjects);

// Admin-protected routes
router.post('/', protect, isAdmin, createSubject);
router.put('/:id', protect, isAdmin, updateSubject);
router.delete('/:id', protect, isAdmin, deleteSubject);

module.exports = router;

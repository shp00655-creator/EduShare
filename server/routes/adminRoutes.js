const express = require('express');
const router = express.Router();
const {
  getBackendDetails,
  getAllUsers,
  updateUserCredits,
  deleteUser,
  getAllNotes,
  deleteNote,
  getAllReports,
  resolveReport,
  toggleUserBan,
  getPendingNotes,
  approveNote,
  rejectNote,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// All routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

router.get('/stats', getBackendDetails);
router.get('/users', getAllUsers);
router.put('/users/:id/credits', updateUserCredits);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/ban', toggleUserBan);

// Verification queue routes (must be before /notes/:id)
router.get('/notes/pending', getPendingNotes);
router.put('/notes/:id/approve', approveNote);
router.put('/notes/:id/reject', rejectNote);

router.get('/notes', getAllNotes);
router.delete('/notes/:id', deleteNote);
router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);

module.exports = router;

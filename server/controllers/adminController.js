const os = require('os');
const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');
const Report = require('../models/Report');
const { deleteFile } = require('../utils/fileUpload');

// Helper to escape special regex characters from user strings
const escapeRegex = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * @desc    Get system status and backend/database metrics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getBackendDetails = async (req, res) => {
  try {
    // 1. Gather OS & Node metrics
    const systemUptime = os.uptime();
    const processUptime = process.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = process.memoryUsage();
    
    const cpuInfo = {
      model: os.cpus()[0]?.model || 'Unknown',
      cores: os.cpus().length,
      speed: os.cpus()[0]?.speed || 0,
      loadAvg: os.loadavg(),
    };

    // 2. DB Metrics
    const dbState = mongoose.connection.readyState;
    const dbStateNames = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    // 3. Application Aggregates
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const pendingNotes = await Note.countDocuments({ status: 'pending' });
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    const downloadStats = await Note.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
    ]);
    const totalDownloads = downloadStats[0]?.totalDownloads || 0;

    // Check configuration status of Env variables (without exposing secrets)
    const envChecklist = {
      PORT: !!process.env.PORT,
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    };

    res.json({
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: processUptime,
        systemUptime: systemUptime,
        cpu: cpuInfo,
        memory: {
          total: totalMem,
          free: freeMem,
          processRss: memoryUsage.rss,
          processHeapTotal: memoryUsage.heapTotal,
          processHeapUsed: memoryUsage.heapUsed,
        }
      },
      database: {
        status: dbStateNames[dbState] || 'Unknown',
        readyState: dbState,
        dbName: mongoose.connection.name || 'N/A',
      },
      aggregates: {
        totalUsers,
        totalNotes,
        pendingNotes,
        totalDownloads,
        totalReports,
        pendingReports,
      },
      envChecklist,
    });
  } catch (error) {
    console.error('Admin Details Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving backend status details', error: error.message });
  }
};

/**
 * @desc    Get all users with search
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, 'i');
      query = {
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
          { rollNumber: { $regex: regex } },
          { branch: { $regex: regex } },
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get Users Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving users', error: error.message });
  }
};

/**
 * @desc    Update user credits directly
 * @route   PUT /api/admin/users/:id/credits
 * @access  Private/Admin
 */
const updateUserCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    if (credits === undefined || isNaN(Number(credits)) || Number(credits) < 0) {
      return res.status(400).json({ message: 'Please provide a valid non-negative credit score.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.credits = Number(credits);
    await user.save();

    res.json({ message: `Successfully updated ${user.name}'s credits to ${user.credits}.`, user });
  } catch (error) {
    console.error('Update Credits Error:', error.message);
    res.status(500).json({ message: 'Server error updating user credits', error: error.message });
  }
};

/**
 * @desc    Delete/ban a user, remove their notes and delete reports involving them
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Delete user's uploaded profile picture if exists
    if (user.profilePicturePublicId) {
      try {
        await deleteFile(user.profilePicturePublicId, user.profilePicture);
      } catch (err) {
        console.error('Error deleting user profile picture:', err.message);
      }
    }

    // 2. Find and delete all notes uploaded by this user, including their files in Cloudinary/local
    const userNotes = await Note.find({ uploadedBy: userId });
    for (const note of userNotes) {
      if (note.publicId) {
        try {
          await deleteFile(note.publicId, note.fileUrl);
        } catch (err) {
          console.error(`Error deleting file for note ${note._id}:`, err.message);
        }
      }
      await note.deleteOne();
    }

    // 3. Delete any reports filed against OR by this user
    await Report.deleteMany({
      $or: [
        { reportedUser: userId },
        { reportedBy: userId }
      ]
    });

    // 4. Finally delete the user
    await user.deleteOne();

    res.json({ message: `Successfully deleted user ${user.name} and all associated content.` });
  } catch (error) {
    console.error('Delete User Error:', error.message);
    res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
};

/**
 * @desc    Get all notes with search and details
 * @route   GET /api/admin/notes
 * @access  Private/Admin
 */
const getAllNotes = async (req, res) => {
  try {
    const { search, status, resourceType } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (resourceType && ['notes', 'question_paper'].includes(resourceType)) {
      query.resourceType = resourceType;
    }

    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      const escapedSearch = escapeRegex(cleanSearch);
      const tagSearch = cleanSearch.startsWith('#')
        ? escapeRegex(cleanSearch.substring(1).trim())
        : escapedSearch;

      const textRegex = new RegExp(escapedSearch, 'i');
      const tagRegex = new RegExp(tagSearch, 'i');

      const tagRegexList = [textRegex];
      if (tagSearch && tagSearch !== escapedSearch) {
        tagRegexList.push(tagRegex);
      }

      // If user provided comma-separated terms (e.g. "os, memory")
      if (cleanSearch.includes(',')) {
        const parts = cleanSearch.split(',').map((p) => p.trim()).filter(Boolean);
        for (const part of parts) {
          const cleanPart = part.startsWith('#') ? part.substring(1).trim() : part;
          const escapedPart = escapeRegex(cleanPart);
          if (escapedPart) {
            tagRegexList.push(new RegExp(escapedPart, 'i'));
          }
        }
      }

      const searchConditions = [
        { title: { $regex: textRegex } },
        { subject: { $regex: textRegex } },
        { subjectCode: { $regex: textRegex } },
        { branch: { $regex: textRegex } },
        { description: { $regex: textRegex } },
        { teacherName: { $regex: textRegex } },
        { tags: { $in: tagRegexList } }
      ];

      if (Object.keys(query).length > 0) {
        query.$and = [{ $or: searchConditions }];
      } else {
        query.$or = searchConditions;
      }
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get Notes Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving notes list', error: error.message });
  }
};

/**
 * @desc    Delete a note from platform
 * @route   DELETE /api/admin/notes/:id
 * @access  Private/Admin
 */
const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // 1. Delete file from storage
    if (note.publicId) {
      try {
        await deleteFile(note.publicId, note.fileUrl);
      } catch (err) {
        console.error('Error deleting file for note:', err.message);
      }
    }

    // 2. Deduct credits from uploader as penalty (optional, let's keep consistency)
    const uploader = await User.findById(note.uploadedBy);
    if (uploader) {
      uploader.credits = Math.max(0, uploader.credits - 10);
      await uploader.save();
    }

    // 3. Remove note document
    await note.deleteOne();

    res.json({ message: 'Note successfully removed from platform. Credits adjusted for uploader.' });
  } catch (error) {
    console.error('Delete Note Error:', error.message);
    res.status(500).json({ message: 'Server error deleting note', error: error.message });
  }
};

/**
 * @desc    Get all user reports
 * @route   GET /api/admin/reports
 * @access  Private/Admin
 */
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('reportedUser', 'name email credits profilePicture isBanned')
      .populate('reportedBy', 'name email profilePicture')
      .populate({
        path: 'reportedNote',
        populate: {
          path: 'uploadedBy',
          select: 'name email profilePicture'
        }
      })
      .sort({ createdAt: -1 });

    // Enrich reports with all uploaded notes by that reported user so admin can check/delete any content
    const enrichedReports = await Promise.all(
      reports.map(async (rep) => {
        const repObj = rep.toObject();
        if (repObj.reportedUser) {
          const userNotes = await Note.find({ uploadedBy: repObj.reportedUser._id })
            .select('title subject branch semester unit teacherName fileUrl publicId views downloads createdAt')
            .sort({ createdAt: -1 });

          repObj.userNotes = userNotes;

          if (!repObj.reportedNote && userNotes.length > 0) {
            repObj.reportedNote = userNotes[0];
          }
        }
        return repObj;
      })
    );

    res.json(enrichedReports);
  } catch (error) {
    console.error('Get Reports Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving user reports', error: error.message });
  }
};

/**
 * @desc    Resolve a user report
 * @route   PUT /api/admin/reports/:id/resolve
 * @access  Private/Admin
 */
const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'resolved';
    await report.save();

    res.json({ message: 'Report marked as resolved successfully.', report });
  } catch (error) {
    console.error('Resolve Report Error:', error.message);
    res.status(500).json({ message: 'Server error resolving report', error: error.message });
  }
};

/**
 * @desc    Toggle a user's ban status (ban or unban)
 * @route   PUT /api/admin/users/:id/ban
 * @access  Private/Admin
 */
const toggleUserBan = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot ban your own administrative account.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ 
      message: `User ${user.name} has been successfully ${user.isBanned ? 'banned' : 'unbanned'}.`, 
      user 
    });
  } catch (error) {
    console.error('Toggle Ban Error:', error.message);
    res.status(500).json({ message: 'Server error toggling ban status', error: error.message });
  }
};

/**
 * @desc    Get all pending notes for admin verification
 * @route   GET /api/admin/notes/pending
 * @access  Private/Admin
 */
const getPendingNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: 'pending' })
      .populate('uploadedBy', 'name email profilePicture credits')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get Pending Notes Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving pending notes', error: error.message });
  }
};

/**
 * @desc    Approve and publish a note, granting +10 credits to uploader
 * @route   PUT /api/admin/notes/:id/approve
 * @access  Private/Admin
 */
const approveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy');
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (note.status === 'approved') {
      return res.status(400).json({ message: 'This note is already approved and live.' });
    }

    note.status = 'approved';
    note.verifiedBy = req.user._id;
    note.verifiedAt = new Date();
    note.rejectionReason = '';
    await note.save();

    // Reward +10 credits to the uploader
    let updatedCredits = 0;
    if (note.uploadedBy) {
      const uploader = await User.findById(note.uploadedBy._id || note.uploadedBy);
      if (uploader) {
        uploader.credits += 10;
        await uploader.save();
        updatedCredits = uploader.credits;
      }
    }

    res.json({
      message: `"${note.title}" has been approved and published to the platform! Uploader was rewarded +10 credits.`,
      note,
      uploaderCredits: updatedCredits
    });
  } catch (error) {
    console.error('Approve Note Error:', error.message);
    res.status(500).json({ message: 'Server error approving note', error: error.message });
  }
};

/**
 * @desc    Reject a note with explanation
 * @route   PUT /api/admin/notes/:id/reject
 * @access  Private/Admin
 */
const rejectNote = async (req, res) => {
  try {
    const { reason } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    note.status = 'rejected';
    note.rejectionReason = reason ? reason.trim() : 'Does not meet academic quality guidelines.';
    note.verifiedBy = req.user._id;
    note.verifiedAt = new Date();
    await note.save();

    res.json({
      message: `Note "${note.title}" marked as rejected.`,
      note
    });
  } catch (error) {
    console.error('Reject Note Error:', error.message);
    res.status(500).json({ message: 'Server error rejecting note', error: error.message });
  }
};

module.exports = {
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
};

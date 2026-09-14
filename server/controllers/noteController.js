const Note = require('../models/Note');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { uploadFile, deleteFile } = require('../utils/fileUpload');

// Helper to escape special regex characters from user strings
const escapeRegex = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * @desc    Upload a new note or question paper (pending admin verification)
 * @route   POST /api/notes
 * @access  Private
 */
const uploadNote = async (req, res) => {
  try {
    const { title, description, branch, semester, subject, subjectCode, resourceType, unit, teacherName, tags } = req.body;

    if (!title || !branch || !semester || !subject) {
      return res.status(400).json({ message: 'Title, Branch, Semester, and Subject are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a note file (PDF, PPT, or Image).' });
    }

    // Curriculum Subject Validation: Verify that subject exists in the recognized Subject collection
    const cleanCode = subjectCode ? subjectCode.trim().toUpperCase() : '';
    const cleanSubject = subject.trim();

    let validSubject = null;
    if (cleanCode) {
      validSubject = await Subject.findOne({ code: cleanCode });
    }
    if (!validSubject && cleanSubject) {
      validSubject = await Subject.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(cleanSubject)}$`, 'i') }
      });
    }

    if (!validSubject) {
      return res.status(400).json({ 
        message: 'Invalid Subject or Subject Code. Only documents for recognized curriculum subjects can be uploaded.' 
      });
    }

    // Duplicate Check: Prevent duplicate uploads if Title + Subject + Semester + Uploader are identical
    const duplicate = await Note.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(title.trim())}$`, 'i') },
      subject: { $regex: new RegExp(`^${escapeRegex(validSubject.name)}$`, 'i') },
      semester: semester.trim(),
      uploadedBy: req.user._id
    });

    if (duplicate) {
      return res.status(400).json({ 
        message: 'Duplicate Upload: You have already uploaded a document with this Title, Subject, and Semester.' 
      });
    }

    // Process Tags: Comma separated or JSON parsed array
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    // Upload file
    const uploadResult = await uploadFile(req.file, 'notes');
    if (!uploadResult || !uploadResult.fileUrl) {
      return res.status(500).json({ message: 'Failed to upload the file to storage.' });
    }

    // Validate resourceType
    const finalResourceType = resourceType === 'question_paper' ? 'question_paper' : 'notes';

    // Create Note with status 'pending'
    const note = await Note.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      branch: branch.trim(),
      semester: semester.trim(),
      subject: validSubject.name,
      subjectCode: validSubject.code,
      resourceType: finalResourceType,
      status: 'pending',
      unit: unit ? unit.trim() : '',
      teacherName: teacherName ? teacherName.trim() : '',
      tags: processedTags,
      fileUrl: uploadResult.fileUrl,
      publicId: uploadResult.publicId,
      uploadedBy: req.user._id
    });

    // Note: Credits (+10) will be rewarded once an Admin approves this document in the Verification Queue.
    res.status(201).json({
      message: 'Upload received! Your document has been submitted for admin verification and will be published once approved.',
      note
    });
  } catch (error) {
    console.error('Note Upload Error:', error.message);
    res.status(500).json({ message: 'Server error during note upload', error: error.message });
  }
};

/**
 * @desc    Get all approved notes (with search and filter)
 * @route   GET /api/notes
 * @access  Public
 */
const getNotes = async (req, res) => {
  try {
    const { search, branch, semester, subject, subjectCode, resourceType, teacherName } = req.query;

    // Public catalog strictly shows approved documents
    const query = { status: 'approved' };

    // Resource Type filter ('notes' or 'question_paper')
    if (resourceType && ['notes', 'question_paper'].includes(resourceType)) {
      query.resourceType = resourceType;
    }

    // Branch filter
    if (branch && branch !== 'All') {
      query.branch = { $regex: new RegExp(`^${escapeRegex(branch)}$`, 'i') };
    }

    // Semester filter
    if (semester && semester !== 'All') {
      query.semester = semester;
    }

    // Subject filter
    if (subject && subject !== '') {
      query.subject = { $regex: new RegExp(escapeRegex(subject), 'i') };
    }

    // Subject Code filter
    if (subjectCode && subjectCode !== '') {
      query.subjectCode = { $regex: new RegExp(`^${escapeRegex(subjectCode)}$`, 'i') };
    }

    // Teacher Name filter
    if (teacherName && teacherName !== '') {
      query.teacherName = { $regex: new RegExp(escapeRegex(teacherName), 'i') };
    }

    // General text search
    if (search && search !== '') {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: new RegExp(escapedSearch, 'i') } },
        { subject: { $regex: new RegExp(escapedSearch, 'i') } },
        { subjectCode: { $regex: new RegExp(escapedSearch, 'i') } },
        { description: { $regex: new RegExp(escapedSearch, 'i') } },
        { teacherName: { $regex: new RegExp(escapedSearch, 'i') } },
        { tags: { $in: [new RegExp(escapedSearch, 'i')] } }
      ];
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name profilePicture credits')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get Notes Error:', error.message);
    res.status(500).json({ message: 'Server error fetching notes', error: error.message });
  }
};

/**
 * @desc    Get note details (increments views)
 * @route   GET /api/notes/:id
 * @access  Public
 */
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploadedBy', 'name profilePicture credits')
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment views
    note.views += 1;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Get Note Details Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving note details', error: error.message });
  }
};

/**
 * @desc    Increment downloads & reward credits
 * @route   POST /api/notes/:id/download
 * @access  Private
 */
const trackDownload = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment downloads count
    note.downloads += 1;
    await note.save();

    // Reward Uploader (+5 Credits) if downloaded by someone else
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      const uploader = await User.findById(note.uploadedBy);
      if (uploader) {
        uploader.credits += 5;
        await uploader.save();
      }
    }

    res.json({ message: 'Download tracked. Uploader rewarded.', downloads: note.downloads });
  } catch (error) {
    console.error('Download Track Error:', error.message);
    res.status(500).json({ message: 'Server error tracking download', error: error.message });
  }
};

/**
 * @desc    Bookmark or Unbookmark a note
 * @route   POST /api/notes/:id/bookmark
 * @access  Private
 */
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const noteId = req.params.id;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const index = user.bookmarks.indexOf(noteId);
    let bookmarked = false;

    if (index > -1) {
      // Already bookmarked, remove it
      user.bookmarks.splice(index, 1);
    } else {
      // Add to bookmark
      user.bookmarks.push(noteId);
      bookmarked = true;
    }

    await user.save();
    res.json({ 
      message: bookmarked ? 'Note added to bookmarks' : 'Note removed from bookmarks', 
      bookmarked,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    console.error('Toggle Bookmark Error:', error.message);
    res.status(500).json({ message: 'Server error toggling bookmark', error: error.message });
  }
};

/**
 * @desc    Rate a note (1-5) and reward credits for quality uploads
 * @route   POST /api/notes/:id/rate
 * @access  Private
 */
const rateNote = async (req, res) => {
  try {
    const { score } = req.body;
    const noteId = req.params.id;
    const userId = req.user._id;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating score must be between 1 and 5.' });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const uploaderId = note.uploadedBy._id ? note.uploadedBy._id.toString() : note.uploadedBy.toString();
    const isSelfRating = uploaderId === userId.toString();

    // Check if user has already rated
    const existingRating = note.ratings.find(r => {
      const ratingUserId = r.user._id ? r.user._id.toString() : r.user.toString();
      return ratingUserId === userId.toString();
    });
    
    let creditAdjustment = 0;
    if (!isSelfRating) {
      if (existingRating) {
        creditAdjustment = Number(score) - Number(existingRating.score);
      } else {
        creditAdjustment = Number(score);
      }
    }

    console.log(`[RateNote] Uploader ID: ${uploaderId}, Self Rating: ${isSelfRating}, Credit Adjustment: ${creditAdjustment}`);

    if (existingRating) {
      existingRating.score = score;
    } else {
      note.ratings.push({ user: userId, score });
    }

    // noteSchema.pre('save') handles averageRating recalculation
    await note.save();

    // Reward / Adjust Uploader credits based on rating stars (1 credit per star)
    if (creditAdjustment !== 0) {
      const uploader = await User.findById(uploaderId);
      if (uploader) {
        const oldCredits = uploader.credits;
        uploader.credits = Math.max(0, uploader.credits + creditAdjustment);
        await uploader.save();
        console.log(`[RateNote] Uploader credits updated from ${oldCredits} to ${uploader.credits}`);
      }
    }

    res.json({ 
      message: 'Rating submitted successfully', 
      ratingsCount: note.ratings.length, 
      averageRating: note.averageRating 
    });
  } catch (error) {
    console.error('Rate Note Error:', error.message);
    res.status(500).json({ message: 'Server error rating note', error: error.message });
  }
};

/**
 * @desc    Add comment to note
 * @route   POST /api/notes/:id/comments
 * @access  Private
 */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const noteId = req.params.id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const comment = {
      user: req.user._id,
      userName: req.user.name,
      text: text.trim()
    };

    note.comments.push(comment);
    await note.save();

    const updatedNote = await Note.findById(noteId)
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture');
    res.json(updatedNote.comments);
  } catch (error) {
    console.error('Add Comment Error:', error.message);
    res.status(500).json({ message: 'Server error adding comment', error: error.message });
  }
};

/**
 * @desc    Edit user comment on note
 * @route   PUT /api/notes/:id/comments/:commentId
 * @access  Private
 */
const editComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: noteId, commentId } = req.params;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const comment = note.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this comment.' });
    }

    comment.text = text.trim();
    await note.save();

    const updatedNote = await Note.findById(noteId)
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture');
    res.json(updatedNote.comments);
  } catch (error) {
    console.error('Edit Comment Error:', error.message);
    res.status(500).json({ message: 'Server error editing comment', error: error.message });
  }
};

/**
 * @desc    Delete comment from note
 * @route   DELETE /api/notes/:id/comments/:commentId
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const { id: noteId, commentId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const comment = note.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this comment.' });
    }

    // Remove comment
    note.comments.pull(commentId);
    await note.save();

    const updatedNote = await Note.findById(noteId)
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture');
    res.json(updatedNote.comments);
  } catch (error) {
    console.error('Delete Comment Error:', error.message);
    res.status(500).json({ message: 'Server error deleting comment', error: error.message });
  }
};

/**
 * @desc    Add a reply to a comment
 * @route   POST /api/notes/:id/comments/:commentId/replies
 * @access  Private
 */
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: noteId, commentId } = req.params;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Reply text cannot be empty.' });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const comment = note.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = {
      user: req.user._id,
      userName: req.user.name,
      text: text.trim()
    };

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push(reply);
    await note.save();

    const updatedNote = await Note.findById(noteId)
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture');

    res.json(updatedNote.comments);
  } catch (error) {
    console.error('Add Reply Error:', error.message);
    res.status(500).json({ message: 'Server error adding reply', error: error.message });
  }
};

/**
 * @desc    Delete a reply from a comment
 * @route   DELETE /api/notes/:id/comments/:commentId/replies/:replyId
 * @access  Private
 */
const deleteReply = async (req, res) => {
  try {
    const { id: noteId, commentId, replyId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const comment = note.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check ownership or admin
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this reply.' });
    }

    comment.replies.pull(replyId);
    await note.save();

    const updatedNote = await Note.findById(noteId)
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture');

    res.json(updatedNote.comments);
  } catch (error) {
    console.error('Delete Reply Error:', error.message);
    res.status(500).json({ message: 'Server error deleting reply', error: error.message });
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check ownership
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this note.' });
    }

    // Delete file from storage
    if (note.publicId) {
      await deleteFile(note.publicId, note.fileUrl);
    }

    // Remove note
    await note.deleteOne();

    // Deduct credits from user
    const user = await User.findById(req.user._id);
    if (user) {
      user.credits = Math.max(0, user.credits - 10);
      await user.save();
    }

    res.json({ message: 'Note deleted and credits updated.', credits: user ? user.credits : 0 });
  } catch (error) {
    console.error('Delete Note Error:', error.message);
    res.status(500).json({ message: 'Server error deleting note', error: error.message });
  }
};

/**
 * @desc    Get user uploads & stats (Dashboard analytics)
 * @route   GET /api/notes/user/stats
 * @access  Private
 */
const getUserStats = async (req, res) => {
  try {
    // Find uploads by user
    const uploads = await Note.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    
    // Count analytics
    const totalUploads = uploads.length;
    const totalViews = uploads.reduce((sum, note) => sum + note.views, 0);
    const totalDownloads = uploads.reduce((sum, note) => sum + note.downloads, 0);

    // Get user details for bookmarks and credits
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'uploadedBy', select: 'name' }
    });

    res.json({
      credits: user.credits,
      totalUploads,
      totalViews,
      totalDownloads,
      uploads,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    console.error('User Stats Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving stats', error: error.message });
  }
};

/**
 * @desc    Get leaderboard (top contributors)
 * @route   GET /api/notes/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('name profilePicture credits branch semester')
      .sort({ credits: -1 })
      .limit(10);
      
    res.json(topUsers);
  } catch (error) {
    console.error('Get Leaderboard Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving leaderboard', error: error.message });
  }
};

/**
 * @desc    Download the note file directly (attaches download headers)
 * @route   GET /api/notes/:id/download-file
 * @access  Private (Allows token query param)
 */
const downloadNoteFile = async (req, res) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment downloads count
    note.downloads += 1;
    await note.save();

    // Reward Uploader (+5 Credits) if downloaded by someone else
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      const uploader = await User.findById(note.uploadedBy);
      if (uploader) {
        uploader.credits += 5;
        await uploader.save();
      }
    }

    // Serve the file
    if (note.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(note.fileUrl);
        const downloadName = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
        return res.download(filePath, downloadName);
      } else {
        return res.status(404).json({ message: 'File not found on local disk' });
      }
    } else {
      const downloadUrl = note.fileUrl.replace('/upload/', '/upload/fl_attachment/');
      return res.redirect(downloadUrl);
    }
  } catch (error) {
    console.error('File Download Stream Error:', error.message);
    res.status(500).json({ message: 'Server error downloading file', error: error.message });
  }
};

module.exports = {
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
};

const Subject = require('../models/Subject');

// Helper to escape regex special characters
const escapeRegex = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * @desc    Get all subjects (with optional branch, semester, or search query)
 * @route   GET /api/subjects
 * @access  Public
 */
const getSubjects = async (req, res) => {
  try {
    const { branch, semester, search } = req.query;
    const query = {};

    if (branch && branch !== 'All') {
      query.branch = { $regex: new RegExp(`^${escapeRegex(branch)}$`, 'i') };
    }

    if (semester && semester !== 'All') {
      query.semester = semester;
    }

    if (search && search.trim() !== '') {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: new RegExp(escaped, 'i') } },
        { code: { $regex: new RegExp(escaped, 'i') } }
      ];
    }

    const subjects = await Subject.find(query).sort({ code: 1, name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('Get Subjects Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving subjects', error: error.message });
  }
};

/**
 * @desc    Create a new subject
 * @route   POST /api/subjects
 * @access  Private/Admin
 */
const createSubject = async (req, res) => {
  try {
    const { name, code, branch, semester } = req.body;

    if (!name || !code || !branch || !semester) {
      return res.status(400).json({ message: 'Subject Name, Subject Code, Branch, and Semester are all required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    // Check if code already exists
    const existing = await Subject.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Subject Code "${cleanCode}" is already assigned to "${existing.name}".` });
    }

    const subject = await Subject.create({
      name: cleanName,
      code: cleanCode,
      branch: branch.trim(),
      semester: semester.trim(),
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Subject added to curriculum successfully.', subject });
  } catch (error) {
    console.error('Create Subject Error:', error.message);
    res.status(500).json({ message: 'Server error creating subject', error: error.message });
  }
};

/**
 * @desc    Update a subject
 * @route   PUT /api/subjects/:id
 * @access  Private/Admin
 */
const updateSubject = async (req, res) => {
  try {
    const { name, code, branch, semester } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      // Check if duplicate with another subject
      const conflict = await Subject.findOne({ code: cleanCode, _id: { $ne: subject._id } });
      if (conflict) {
        return res.status(400).json({ message: `Subject Code "${cleanCode}" is already taken by another subject.` });
      }
      subject.code = cleanCode;
    }

    if (name) subject.name = name.trim();
    if (branch) subject.branch = branch.trim();
    if (semester) subject.semester = semester.trim();

    await subject.save();
    res.json({ message: 'Subject updated successfully.', subject });
  } catch (error) {
    console.error('Update Subject Error:', error.message);
    res.status(500).json({ message: 'Server error updating subject', error: error.message });
  }
};

/**
 * @desc    Delete a subject
 * @route   DELETE /api/subjects/:id
 * @access  Private/Admin
 */
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    await subject.deleteOne();
    res.json({ message: `Subject "${subject.code} - ${subject.name}" deleted successfully.` });
  } catch (error) {
    console.error('Delete Subject Error:', error.message);
    res.status(500).json({ message: 'Server error deleting subject', error: error.message });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
};

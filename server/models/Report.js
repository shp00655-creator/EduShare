const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedNote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  },
  reason: {
    type: String,
    required: [true, 'Reason for reporting is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

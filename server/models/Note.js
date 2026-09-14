const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  replies: [replySchema]
}, { timestamps: true });

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  subjectCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  resourceType: {
    type: String,
    enum: ['notes', 'question_paper'],
    default: 'notes'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  unit: {
    type: String,
    trim: true
  },
  teacherName: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  publicId: {
    type: String,
    default: ""
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  comments: [commentSchema]
}, { timestamps: true });

// Pre-save middleware to update averageRating if ratings change
noteSchema.pre('save', function() {
  if (this.isModified('ratings')) {
    if (this.ratings.length === 0) {
      this.averageRating = 0;
    } else {
      const sum = this.ratings.reduce((acc, curr) => acc + curr.score, 0);
      this.averageRating = Number((sum / this.ratings.length).toFixed(1));
    }
  }
});

module.exports = mongoose.model('Note', noteSchema);

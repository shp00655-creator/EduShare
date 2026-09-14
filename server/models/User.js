const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  rollNumber: { 
    type: String,
    trim: true
  },
  branch: { 
    type: String,
    trim: true
  },
  semester: { 
    type: String,
    trim: true
  },
  profilePicture: { 
    type: String, 
    default: "" 
  },
  profilePicturePublicId: { 
    type: String, 
    default: "" 
  },
  bookmarks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Note' 
  }],
  credits: { 
    type: Number, 
    default: 0 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

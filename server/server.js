const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB().then(() => {
  const seedAdmin = require('./utils/seedAdmin');
  seedAdmin();
  const seedSubjectsAndMigrateNotes = require('./utils/seedSubjects');
  seedSubjectsAndMigrateNotes();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files for fallback local storage
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// Error handling middleware for file size or other multer exceptions
app.use((err, req, res, next) => {
  if (err instanceof Error) {
    console.error('Express Error Handler:', err.message);
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://leave-mangement-blond.vercel.app', // correct Vercel frontend domain
    'http://localhost:3000' // for local dev
  ],
  credentials: true
}));
app.use(express.json());

// Import routes
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Use routes
app.use('/api', userRoutes);
app.use('/api', leaveRoutes);
app.use('/api', departmentRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Leave Management API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

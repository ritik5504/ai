const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

// Start listening immediately so cloud platforms (Render, Railway, etc.) detect open port
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to establish database connection:', err.message);
});

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_investment_agent';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary DB connection failed (${error.message}). Attempting fallback to local MongoDB...`);
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/ai_investment_agent', { serverSelectionTimeoutMS: 5000 });
      console.log(`Fallback MongoDB Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.warn(`Database Connection Warning: ${fallbackError.message}. Operating in stateless mode.`);
    }
  }
};

module.exports = connectDB;


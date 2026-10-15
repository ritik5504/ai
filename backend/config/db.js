const mongoose = require('mongoose');

// Prevent Mongoose from stalling operations for 10s when DB is unreachable
mongoose.set('bufferTimeoutMS', 1500);
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_investment_agent';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary DB connection failed (${error.message}).`);
    if (uri !== 'mongodb://127.0.0.1:27017/ai_investment_agent') {
      try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/ai_investment_agent', { serverSelectionTimeoutMS: 2000 });
        console.log(`Fallback MongoDB Connected: ${conn.connection.host}`);
      } catch (fallbackError) {
        console.warn(`Local DB fallback failed (${fallbackError.message}). Operating in stateless mode.`);
      }
    } else {
      console.warn('Operating in stateless mode.');
    }
  }
};

module.exports = connectDB;


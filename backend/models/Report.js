const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  overview: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  opportunities: [{
    type: String
  }],
  threats: [{
    type: String
  }],
  investmentDecision: {
    type: String,
    enum: ['INVEST', 'PASS'],
    required: true
  },
  reasoning: {
    type: String,
    required: true
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  tickerSymbol: {
    type: String,
    required: true,
    trim: true
  },
  fairValueEstimate: {
    type: String
  },
  buyRange: {
    type: String
  },
  targetPrice: {
    type: String
  },
  chartData: [{
    date: { type: String, required: true },
    close: { type: Number, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);

# AI Investment Research Agent - Build Specification

This document contains a complete technical blueprint and copy-pasteable codebase structure for the **AI Investment Research Agent**. This specification is structured so that you can pass it to any AI developer assistant (such as ChatGPT, Claude, or Cursor) to generate a fully functioning application.

---

## 1. Project Directory Layout
```text
AI-Investment-Agent/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── HistoryList.jsx
│       │   ├── ReportViewer.jsx
│       │   └── SearchBox.jsx
│       └── services/
│           └── api.js
├── backend/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── analyzeController.js
│   ├── models/
│   │   ├── Report.js
│   │   └── SearchHistory.js
│   ├── routes/
│   │   └── analyzeRoutes.js
│   └── services/
│       └── aiService.js
└── README.md
```

---

## 2. Backend Implementation (Node.js + Express + MongoDB + LangChain)

### `backend/package.json`
```json
{
  "name": "ai-investment-agent-server",
  "version": "1.0.0",
  "description": "Backend server for AI Investment Research Agent",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.11.0",
    "@langchain/core": "^0.2.0",
    "@langchain/google-genai": "^0.0.16",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "langchain": "^0.2.0",
    "mongoose": "^8.4.0",
    "morgan": "^1.10.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_investment_agent
GEMINI_API_KEY=your_gemini_api_key_here
```

### `backend/config/db.js`
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### `backend/models/Report.js`
```javascript
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
```

### `backend/models/SearchHistory.js`
```javascript
const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
```

### `backend/services/aiService.js`
```javascript
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers');
const { z } = require('zod');

// Schema specification for LangChain StructuredOutputParser
const reportZodSchema = z.object({
  companyName: z.string().describe('The clean official name of the company researched.'),
  overview: z.string().describe('Comprehensive business overview of the company.'),
  industry: z.string().describe('Detailed industry sector analysis and market dynamics.'),
  strengths: z.array(z.string()).describe('List of 3-5 core business/financial strengths.'),
  weaknesses: z.array(z.string()).describe('List of 3-5 core weaknesses or current issues.'),
  opportunities: z.array(z.string()).describe('List of 3-5 growth opportunities and positive catalysts.'),
  threats: z.array(z.string()).describe('List of 3-5 macro or competitive threats/risks.'),
  investmentDecision: z.enum(['INVEST', 'PASS']).describe('Final investment recommendation decision: must be either INVEST or PASS.'),
  reasoning: z.string().describe('Detailed professional analyst reasoning supporting the investment decision.'),
  confidenceScore: z.number().int().min(0).max(100).describe('Confidence score from 0 to 100 on this recommendation.')
});

const parser = StructuredOutputParser.fromZodSchema(reportZodSchema);

const generateInvestmentReport = async (companyName) => {
  // Initialize the Gemini Model using LangChain's Google GenAI integration
  const model = new ChatGoogleGenerativeAI({
    modelName: 'gemini-1.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2 // Lower temperature for analytical reliability
  });

  const promptTemplate = new PromptTemplate({
    template: `You are an expert Wall Street investment research analyst.
Conduct comprehensive research and provide a structured investment evaluation for: {company}

Your task is to analyze the company's fundamentals, business model, market position, financial health, and risks, and make an objective decision whether to INVEST or PASS.

{format_instructions}

Ensure all fields in the JSON schema are populated. Do not return empty fields. Include specific details and data points where appropriate.`,
    inputVariables: ['company'],
    partialVariables: {
      format_instructions: parser.getFormatInstructions()
    }
  });

  const input = await promptTemplate.format({ company: companyName });
  
  try {
    const response = await model.invoke(input);
    const parsedOutput = await parser.parse(response.content);
    return parsedOutput;
  } catch (error) {
    console.error('LangChain/Gemini Generation Error:', error);
    // Fallback JSON parser if LangChain format parser fails due to output format issues
    try {
      const rawText = error.output || error.message;
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const cleanedJson = rawText.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(cleanedJson);
      }
    } catch (innerError) {
      throw new Error(`Failed to generate or parse AI analysis: ${innerError.message}`);
    }
    throw error;
  }
};

module.exports = {
  generateInvestmentReport
};
```

### `backend/controllers/analyzeController.js`
```javascript
const Report = require('../models/Report');
const SearchHistory = require('../models/SearchHistory');
const aiService = require('../services/aiService');

// @desc    Analyze company investment potential
// @route   POST /api/analyze
// @access  Public
const analyzeCompany = async (req, res) => {
  const { company } = req.body;

  if (!company || company.trim() === '') {
    return res.status(400).json({ error: 'Company name is required.' });
  }

  try {
    // 1. Add to search history log
    await SearchHistory.create({ companyName: company.trim() });

    // 2. Generate the report via LangChain & Gemini
    const reportData = await aiService.generateInvestmentReport(company.trim());

    // 3. Save report to database
    const savedReport = await Report.create(reportData);

    return res.status(200).json(savedReport);
  } catch (error) {
    console.error('Error in analyzeCompany:', error);
    return res.status(500).json({ 
      error: 'An error occurred while generating the report. Please try again.',
      details: error.message 
    });
  }
};

// @desc    Get search history
// @route   GET /api/history
// @access  Public
const getHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find().sort({ searchedAt: -1 }).limit(20);
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error in getHistory:', error);
    return res.status(500).json({ error: 'Failed to fetch search history.' });
  }
};

// @desc    Delete custom reports by ID
// @route   DELETE /api/report/:id
// @access  Public
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    return res.status(200).json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteReport:', error);
    return res.status(500).json({ error: 'Failed to delete report.' });
  }
};

module.exports = {
  analyzeCompany,
  getHistory,
  deleteReport
};
```

### `backend/routes/analyzeRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const { analyzeCompany, getHistory, deleteReport } = require('../controllers/analyzeController');

router.post('/analyze', analyzeCompany);
router.get('/history', getHistory);
router.delete('/report/:id', deleteReport);

module.exports = router;
```

### `backend/app.js`
```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', analyzeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
```

### `backend/server.js`
```javascript
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database first, then run server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to establish server connection:', err);
});
```

---

## 3. Frontend Implementation (React + Axios + Tailwind CSS)

### `frontend/package.json`
```json
{
  "name": "ai-investment-agent-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-icons": "^5.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.11"
  }
}
```

### `frontend/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',
        darkCard: '#1e293b',
        primaryGreen: '#10b981',
        primaryRed: '#ef4444',
        accentBlue: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### `frontend/postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `frontend/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📈</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <title>AI Investment Research Agent</title>
  </head>
  <body class="bg-[#0b0f19] text-gray-100 font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #0b0f19;
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}

/* Glassmorphism custom classes */
.glass-panel {
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

/* Micro-animations */
@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.03);
  }
}

.glow-effect {
  position: relative;
}
.glow-effect::before {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  background: linear-gradient(45deg, #3b82f6, #10b981);
  border-radius: inherit;
  z-index: -1;
  filter: blur(8px);
  opacity: 0.15;
  transition: opacity 0.3s ease;
}
.glow-effect:hover::before {
  opacity: 0.35;
}
```

### `frontend/src/services/api.js`
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeCompany = async (companyName) => {
  const response = await API.post('/analyze', { company: companyName });
  return response.data;
};

export const getSearchHistory = async () => {
  const response = await API.get('/history');
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await API.delete(`/report/${id}`);
  return response.data;
};
```

### `frontend/src/components/SearchBox.jsx`
```jsx
import React, { useState } from 'react';
import { FiSearch, FiLoader } from 'react-icons/fi';

const SearchBox = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 text-xl" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter company name (e.g., Apple, Tesla, Nvidia)..."
          disabled={isLoading}
          className="w-full pl-12 pr-28 py-4 bg-slate-900 border border-slate-700/60 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-lg text-lg"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 shadow"
        >
          {isLoading ? (
            <>
              <FiLoader className="animate-spin" />
              <span>Analyzing</span>
            </>
          ) : (
            <span>Research</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBox;
```

### `frontend/src/components/ReportViewer.jsx`
```jsx
import React from 'react';
import { FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiXCircle, FiPercent, FiTrash2 } from 'react-icons/fi';

const ReportViewer = ({ report, onDelete }) => {
  if (!report) return null;

  const isInvest = report.investmentDecision === 'INVEST';

  return (
    <div className="w-full max-w-4xl mx-auto my-8 glass-card rounded-3xl p-6 md:p-8 animate-fade-in border border-slate-700/50">
      {/* Top Banner Decision */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/30">
            Investment Report
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            {report.companyName}
          </h2>
          <p className="text-gray-400 text-sm mt-1">Sector: {report.industry}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Decision Badge */}
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-lg border shadow-xl ${
            isInvest 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {isInvest ? <FiCheckCircle className="text-xl" /> : <FiXCircle className="text-xl" />}
            <span>{report.investmentDecision}</span>
          </div>

          {/* Confidence Score */}
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl text-center">
            <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Confidence</span>
            <span className="text-xl font-bold text-blue-400 flex items-center justify-center gap-0.5">
              {report.confidenceScore} <FiPercent className="text-sm" />
            </span>
          </div>

          {/* Delete Action */}
          {report._id && (
            <button
              onClick={() => onDelete(report._id)}
              className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl border border-transparent hover:border-rose-900/30 transition-all"
              title="Delete report"
            >
              <FiTrash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Business Overview */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-slate-200 mb-3 uppercase tracking-wider text-left border-l-4 border-teal-500 pl-3">
          Business Overview
        </h3>
        <p className="text-gray-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800/40">
          {report.overview}
        </p>
      </section>

      {/* SWOT Analysis Grid */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-slate-200 mb-4 uppercase tracking-wider text-left border-l-4 border-blue-500 pl-3">
          SWOT Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-emerald-950/15 border border-emerald-900/20 rounded-2xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Strengths
            </h4>
            <ul className="space-y-2.5 text-gray-300 text-sm list-disc pl-4 text-left">
              {report.strengths.map((str, i) => <li key={i}>{str}</li>)}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-amber-950/15 border border-amber-900/20 rounded-2xl p-5">
            <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Weaknesses
            </h4>
            <ul className="space-y-2.5 text-gray-300 text-sm list-disc pl-4 text-left">
              {report.weaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-blue-950/15 border border-blue-900/20 rounded-2xl p-5">
            <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Opportunities
            </h4>
            <ul className="space-y-2.5 text-gray-300 text-sm list-disc pl-4 text-left">
              {report.opportunities.map((opp, i) => <li key={i}>{opp}</li>)}
            </ul>
          </div>

          {/* Threats */}
          <div className="bg-rose-950/15 border border-rose-900/20 rounded-2xl p-5">
            <h4 className="text-rose-400 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Threats & Risks
            </h4>
            <ul className="space-y-2.5 text-gray-300 text-sm list-disc pl-4 text-left">
              {report.threats.map((thr, i) => <li key={i}>{thr}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Analyst Decision & Reasoning */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
          {isInvest ? (
            <FiTrendingUp className="text-emerald-400 text-xl animate-bounce" />
          ) : (
            <FiAlertTriangle className="text-amber-400 text-xl" />
          )}
          <span>Investment Reasoning & Recommendation</span>
        </h4>
        <p className="text-gray-300 leading-relaxed text-left text-sm md:text-base">
          {report.reasoning}
        </p>
      </section>
    </div>
  );
};

export default ReportViewer;
```

### `frontend/src/components/HistoryList.jsx`
```jsx
import React from 'react';
import { FiClock, FiChevronRight } from 'react-icons/fi';

const HistoryList = ({ history, onSelectHistory }) => {
  if (!history || history.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 text-center text-gray-500 border border-slate-800">
        <p className="text-sm">No recent search history.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
        <FiClock className="text-blue-400" />
        <span>Recent Queries</span>
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {history.map((item, idx) => (
          <button
            key={item._id || idx}
            onClick={() => onSelectHistory(item.companyName)}
            className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-slate-700/50 transition-all group"
          >
            <div className="truncate pr-2">
              <span className="font-semibold text-slate-200 group-hover:text-white transition-colors block truncate text-sm">
                {item.companyName}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {new Date(item.searchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.searchedAt).toLocaleDateString()}
              </span>
            </div>
            <FiChevronRight className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
```

### `frontend/src/App.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import SearchBox from './components/SearchBox';
import ReportViewer from './components/ReportViewer';
import HistoryList from './components/HistoryList';
import { analyzeCompany, getSearchHistory, deleteReport } from './services/api';
import { FiTrendingUp, FiActivity } from 'react-icons/fi';

function App() {
  const [currentReport, setCurrentReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getSearchHistory();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleSearch = async (companyName) => {
    setIsLoading(true);
    setError('');
    setCurrentReport(null);

    try {
      const report = await analyzeCompany(companyName);
      setCurrentReport(report);
      await fetchHistory(); // Refresh history log list
    } catch (err) {
      console.error('Search error:', err);
      setError(
        err.response?.data?.error || 
        'Failed to generate report. Please check API connection and Gemini credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      setCurrentReport(null);
      await fetchHistory();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete the report.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-between">
      {/* Background radial overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-blue-900/10 via-emerald-900/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentReport(null); setError(''); }}>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <FiTrendingUp className="text-emerald-400 text-xl" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              EquityIntel Agent
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-emerald-400 font-medium">Gemini Connected</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full z-10">
        <div className="text-center max-w-2xl mx-auto mt-6 mb-4">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Invest with <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">AI Intelligence</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Enter a ticker or company name. Our AI analyst searches business models, SWOT indexes, and industry vectors to deliver immediate recommendations.
          </p>
        </div>

        {/* Input Control */}
        <SearchBox onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Dialog */}
        {error && (
          <div className="w-full max-w-2xl mx-auto my-4 p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Dynamic Loading Overlay */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-pulse">
            <div className="p-4 bg-emerald-500/5 rounded-full border border-emerald-500/20 animate-spin duration-3000">
              <FiActivity className="text-emerald-400 text-3xl" />
            </div>
            <div className="text-center">
              <h4 className="text-slate-200 font-semibold text-lg">AI Investment Agent researching...</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Evaluating balance sheets, SWOT profiles, competitive threats, and structural outlooks.</p>
            </div>
          </div>
        )}

        {/* Workspace Layout */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            {/* Report Display */}
            <div className="lg:col-span-8">
              {currentReport ? (
                <ReportViewer report={currentReport} onDelete={handleDelete} />
              ) : (
                <div className="h-full min-h-[300px] flex flex-col justify-center items-center text-center p-8 border border-dashed border-slate-800 rounded-3xl bg-slate-950/10">
                  <span className="text-4xl mb-3">🔍</span>
                  <h4 className="text-slate-400 font-medium">Ready for Investment Research</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">Submit a company name above to generate or view analysis metrics.</p>
                </div>
              )}
            </div>

            {/* Sidebar Queries History */}
            <div className="lg:col-span-4">
              <HistoryList history={history} onSelectHistory={handleSearch} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 bg-slate-950/40 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EquityIntel. Built for AI Product Development Intern Submission.</p>
          <p className="mt-1">Notice: Recommendations are LLM-generated and should not substitute licensed financial advice.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
```

### `frontend/src/main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

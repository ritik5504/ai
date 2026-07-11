import React, { useState, useEffect } from 'react';
import SearchBox from './components/SearchBox';
import ReportViewer from './components/ReportViewer';
import HistoryList from './components/HistoryList';
import IntroSplash from './components/IntroSplash';
import { analyzeCompany, getSearchHistory, deleteReport } from './services/api';
import { FiTrendingUp, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Sequenced Step Research Loader Component - Dark Theme
const ResearchLoader = ({ company }) => {
  const steps = [
    `Analyzing ${company}...`,
    '📈 Collecting Company Data',
    '📰 Reading Market Trends',
    '📊 Building SWOT Analysis',
    '🤖 Generating Recommendation',
    '✓ Report Ready'
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000); // Trigger next step every second

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 gap-6 max-w-sm mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-4 bg-emerald-950/40 rounded-full border border-emerald-900/30 animate-spin duration-3000">
        <FiActivity className="text-emerald-400 text-3xl" />
      </div>
      
      <div className="w-full bg-[#0a0a0d] border border-neutral-800/80 rounded-2xl p-6 shadow-2xl text-left space-y-3 glass-card">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          
          return (
            <motion.div 
              key={idx}
              className={`flex items-center gap-3 text-xs md:text-sm transition-colors duration-300 ${
                isActive 
                  ? 'text-emerald-400 font-semibold' 
                  : isDone 
                    ? 'text-slate-400' 
                    : 'text-slate-600'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: idx <= currentStep ? 1 : 0.25, 
                x: idx <= currentStep ? 0 : -10 
              }}
              transition={{ duration: 0.3 }}
            >
              <span className={`w-2 h-2 rounded-full ${
                isActive 
                  ? 'bg-emerald-400 animate-pulse' 
                  : isDone 
                    ? 'bg-slate-500' 
                    : 'bg-slate-700'
              }`}></span>
              <span>{step}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

function App() {
  const [currentReport, setCurrentReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchingCompany, setSearchingCompany] = useState('');
  const [error, setError] = useState('');
  const [introActive, setIntroActive] = useState(true);

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
    setSearchingCompany(companyName);
    setError('');
    setCurrentReport(null);

    try {
      const report = await analyzeCompany(companyName);
      // Wait for loader simulation sequence to reach report status (minimum 5.5 seconds visual delay)
      await new Promise(resolve => setTimeout(resolve, 5500));
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

  const handleSelectReport = (report) => {
    setCurrentReport(report);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#050507] bg-dot-grid flex flex-col justify-between overflow-x-hidden text-[#f8fafc] relative">
      <AnimatePresence mode="wait">
        {introActive && (
          <IntroSplash key="splash" onComplete={() => setIntroActive(false)} />
        )}
      </AnimatePresence>

      {/* Slowly floating animated gradients in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[130px] animate-float-1"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-950/5 rounded-full blur-[140px] animate-float-2"></div>
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-indigo-950/5 rounded-full blur-[120px] animate-float-1"></div>
      </div>

      {/* Header */}
      <motion.header 
        className="border-b border-neutral-900/80 bg-black/40 backdrop-blur-md sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => { setCurrentReport(null); setError(''); }}>
            <div className="p-2 bg-neutral-900 border border-neutral-800/80 rounded-xl">
              <FiTrendingUp className="text-[#0066FF] text-xl" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              EquityIntel Agent
            </span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/30 px-3 py-1 rounded-full text-xs text-emerald-400 font-medium">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Gemini Connected</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full z-10">
        <motion.div 
          className="text-center max-w-2xl mx-auto mt-6 mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Invest with <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0066FF] to-blue-500">AI Intelligence</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Enter a ticker or company name. Our AI analyst searches business models, SWOT indexes, and industry vectors to deliver immediate recommendations.
          </p>
        </motion.div>

        {/* Input Control */}
        <SearchBox onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Dialog */}
        {error && (
          <div className="w-full max-w-2xl mx-auto my-4 p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Interactive transitions area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <ResearchLoader key="loader" company={searchingCompany} />
          ) : (
            <motion.div 
              key="content"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Report Display */}
              <div className="lg:col-span-8">
                {currentReport ? (
                  <ReportViewer report={currentReport} onDelete={handleDelete} />
                ) : (
                  <motion.div 
                    className="h-full min-h-[300px] flex flex-col justify-center items-center text-center p-8 border border-dashed border-neutral-900 rounded-3xl bg-[#0a0a0d]/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-4xl mb-3">🔍</span>
                    <h4 className="text-slate-400 font-medium">Ready for Investment Research</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Submit a company name above to generate or view analysis metrics.</p>
                  </motion.div>
                )}
              </div>

              {/* Sidebar Queries History */}
              <div className="lg:col-span-4">
                <HistoryList history={history} onSelectReport={handleSelectReport} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900/80 py-6 bg-black/40 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EquityIntel. Built for AI Product Development Intern Submission.</p>
          <p className="mt-1">Notice: Recommendations are LLM-generated and should not substitute licensed financial advice.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

import React from 'react';
import { FiClock, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MiniSparkline = ({ chartData }) => {
  if (!chartData || chartData.length < 2) return null;
  
  const prices = chartData.map(d => d.close);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  const width = 60;
  const height = 20;
  const padding = 2;

  const points = chartData.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (chartData.length - 1);
    const y = height - padding - ((d.close - minPrice) * (height - padding * 2)) / range;
    return `${x},${y}`;
  }).join(" ");

  const isUp = prices[prices.length - 1] >= prices[0];
  const strokeColor = isUp ? '#10b981' : '#ef4444'; // Green if up, Red if down

  return (
    <svg width={width} height={height} className="opacity-95">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// Framer Motion Variants for staggered entry
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 } 
  }
};

const HistoryList = ({ history, onSelectReport }) => {
  if (!history || history.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 text-center text-gray-400 border border-slate-200">
        <p className="text-sm">No recent search history.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="glass-card rounded-2xl p-5 border border-slate-200 text-left shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-2.5 font-mono">
        <FiClock className="text-[#0066FF]" />
        <span>Recent Evaluations</span>
      </h3>
      
      <motion.div 
        className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {history.map((item, idx) => {
          const isInvest = item.investmentDecision === 'INVEST';
          
          return (
            <motion.button
              key={item._id || idx}
              onClick={() => onSelectReport(item)}
              className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-slate-100/70 hover:border-slate-300 transition-all group animate-duration-500"
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 4, borderColor: "#111111" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="truncate pr-2 max-w-[55%]">
                <span className="font-bold text-slate-800 group-hover:text-black transition-colors block truncate text-sm">
                  {item.companyName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  {item.tickerSymbol ? item.tickerSymbol.toUpperCase() : "STOCK"}
                </span>
              </div>
              
              {/* Mini Sparkline Chart */}
              <div className="flex-shrink-0 px-2" title="10-day price trend">
                {item.chartData && item.chartData.length > 0 ? (
                  <MiniSparkline chartData={item.chartData} />
                ) : (
                  <span className="text-[10px] text-slate-300 font-mono">No Chart</span>
                )}
              </div>

              {/* Recommendation Badge */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isInvest 
                    ? 'bg-emerald-50/10 border-emerald-500/20 text-emerald-600' 
                    : 'bg-rose-50/10 border-rose-500/20 text-rose-600'
                }`}>
                  {item.investmentDecision}
                </span>
                <FiChevronRight className="text-slate-400 group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default HistoryList;

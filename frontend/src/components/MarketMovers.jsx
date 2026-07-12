import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getMarketMovers } from '../services/api';

const MiniSparkline = ({ chartData, isUp }) => {
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

  const strokeColor = isUp ? '#10b981' : '#ef4444';

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

const MarketMovers = () => {
  const [data, setData] = useState({ gainers: [], losers: [] });
  const [activeTab, setActiveTab] = useState('gainers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const movers = await getMarketMovers();
        setData(movers);
      } catch (err) {
        console.error('Error fetching movers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovers();
  }, []);

  const currentList = activeTab === 'gainers' ? data.gainers : data.losers;

  return (
    <motion.div 
      className="glass-card rounded-2xl p-5 border border-neutral-800/80 text-left shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-neutral-900 pb-2.5 font-mono">
        <FiActivity className="text-[#0066FF]" />
        <span>Today's Market Movers</span>
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('gainers')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
            activeTab === 'gainers'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
              : 'bg-transparent border-neutral-900 text-slate-500 hover:text-slate-300'
          }`}
        >
          <FiTrendingUp size={14} />
          <span>Top Gainers</span>
        </button>
        <button
          onClick={() => setActiveTab('losers')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
            activeTab === 'losers'
              ? 'bg-rose-950/30 border-rose-500/30 text-rose-400'
              : 'bg-transparent border-neutral-900 text-slate-500 hover:text-slate-300'
          }`}
        >
          <FiTrendingDown size={14} />
          <span>Top Losers</span>
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-mono">
          <span>Loading quotes...</span>
        </div>
      ) : (
        <div className="space-y-2.5 min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'gainers' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'gainers' ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5"
            >
              {currentList.map((stock, idx) => {
                const isGainer = activeTab === 'gainers';
                
                return (
                  <motion.div
                    key={stock.symbol || idx}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-neutral-900 hover:border-neutral-800 transition-all group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="truncate pr-2 max-w-[48%]">
                      <span className="font-bold text-slate-200 block truncate text-xs">
                        {stock.name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5 uppercase">
                        {stock.symbol}
                      </span>
                    </div>

                    {/* Sparkline Graph */}
                    <div className="flex-shrink-0 px-2" title="Daily sparkline trend">
                      <MiniSparkline chartData={stock.chartData} isUp={isGainer} />
                    </div>

                    {/* Price and Percentage Change */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-slate-200 block font-mono">
                        ₹{stock.price.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[9px] font-extrabold font-mono block mt-0.5 ${
                        isGainer ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isGainer ? '+' : ''}{stock.changePercent}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default MarketMovers;

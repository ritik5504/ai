import React from 'react';
import { FiCheckCircle, FiXCircle, FiPercent, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Animated Number Counter Component
const AnimatedCounter = ({ target }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    setCount(0); // Reset count on target change
    let start = 0;
    const duration = 800; // 0.8 seconds
    const fps = 60;
    const increment = target / (duration / (1000 / fps));
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setCount(target);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / fps);
    
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}</span>;
};

// SVG Line Chart Component - Matte Light Dynamic style (Green if up, Red if down)
const FramerStockChart = ({ chartData, tickerSymbol }) => {
  if (!chartData || chartData.length === 0) return null;

  const prices = chartData.map(d => d.close);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const isUp = prices[prices.length - 1] >= prices[0];
  const strokeColor = isUp ? '#10b981' : '#ef4444'; // Green or Red
  const stopColor = isUp ? '#10b981' : '#ef4444';

  // SVG dimensions
  const width = 680;
  const height = 200;
  const padding = 25;

  const points = chartData.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (chartData.length - 1);
    const y = height - padding - ((d.close - minPrice) * (height - padding * 2)) / priceRange;
    return { x, y, price: d.close, date: d.date };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area under line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full text-left border-y border-slate-100 py-6 my-6 relative bg-white rounded-xl shadow-inner">
      <div className="absolute top-2 left-6 text-[9px] text-[#888888] font-mono select-none">
        CLOSE PRICE (INR)
      </div>
      <div className="relative w-full overflow-x-auto select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px]">
          {/* Glowing filter adjusting green/red dynamically */}
          <defs>
            <filter id="stockGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stopColor} stopOpacity="0.1" />
              <stop offset="100%" stopColor={stopColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grids / Guidelines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(0,0,0,0.02)" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(0,0,0,0.02)" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(0,0,0,0.06)" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartAreaGradient)" />

          {/* Trend Line (Green/Red with dynamic glow) */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#stockGlow)" />

          {/* Data Nodes */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke={strokeColor} strokeWidth="1.2" className="transition-all duration-200 hover:r-5" />
              {/* Tooltip */}
              <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[9px] fill-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 px-1.5 py-0.5 pointer-events-none font-mono">
                ₹{p.price}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Axis Date Labels */}
      <div className="flex justify-between px-6 mt-2 text-[9px] text-[#888888] font-mono select-none">
        <span>{chartData[0]?.date}</span>
        <span>{chartData[chartData.length - 1]?.date}</span>
      </div>
    </div>
  );
};

const ReportViewer = ({ report, onDelete }) => {
  if (!report) return null;

  const isInvest = report.investmentDecision === 'INVEST';
  const startDate = report.chartData?.[0]?.date || 'Dec 1';
  const endDate = report.chartData?.[report.chartData.length - 1]?.date || 'Dec 10';

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto my-8 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 text-[#111111] shadow-sm"
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top Title & Header Navigation Row */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0066FF] bg-blue-50 px-2.5 py-1 rounded">
            EquityIntel Report
          </span>
          <h2 className="text-2xl font-black tracking-tight text-[#111111] mt-2 flex items-center gap-2">
            {report.companyName}
            {report.tickerSymbol && (
              <span className="text-slate-400 font-mono text-lg">({report.tickerSymbol.toUpperCase()})</span>
            )}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 text-left">Sector: {report.industry}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-md text-[10px] text-slate-500 font-mono select-none">
            <span>Last 10 days</span>
            <span className="text-slate-300">|</span>
            <span>{startDate} — {endDate}</span>
          </div>

          {report._id && (
            <button
              onClick={() => onDelete(report._id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200 transition-all"
              title="Delete report"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Indicators (Framer Style Horizontal Statistics) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-y-4 md:gap-y-0 md:divide-x divide-slate-200/80 border-b border-slate-100 pb-6 mb-6 select-none text-left">
        {/* Metric 1: Live Decision */}
        <div className="pr-4">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block flex items-center gap-1">
            Live Decision
            <span className={`h-1.5 w-1.5 rounded-full inline-block ${isInvest ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          </span>
          <span className={`text-xl font-bold tracking-tight block mt-1 ${isInvest ? 'text-emerald-500' : 'text-rose-500'}`}>
            {report.investmentDecision}
          </span>
        </div>

        {/* Metric 2: Confidence */}
        <div className="px-0 md:px-4">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">Confidence Score</span>
          <span className="text-xl font-bold text-blue-600 flex items-center mt-1">
            <AnimatedCounter target={report.confidenceScore} />%
          </span>
        </div>

        {/* Metric 3: Fair Value */}
        <div className="px-0 md:px-4">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">Fair Value</span>
          <span className="text-xl font-bold text-slate-800 block mt-1 truncate">
            {report.fairValueEstimate || "N/A"}
          </span>
        </div>

        {/* Metric 4: Entry Range */}
        <div className="px-0 md:px-4">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">Target Buy Range</span>
          <span className={`text-xl font-bold block mt-1 truncate ${isInvest ? 'text-emerald-500' : 'text-slate-500'}`}>
            {report.buyRange || "N/A"}
          </span>
        </div>

        {/* Metric 5: 1-Yr Target */}
        <div className="px-0 md:pl-4">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">1-Yr Target</span>
          <span className="text-xl font-bold text-blue-600 block mt-1 truncate">
            {report.targetPrice || "N/A"}
          </span>
        </div>
      </section>

      {/* SVG Chart display */}
      {report.chartData && report.chartData.length > 0 && (
        <FramerStockChart chartData={report.chartData} tickerSymbol={report.tickerSymbol} />
      )}

      {/* Business Overview Description */}
      <section className="text-left mb-8">
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">
          Executive Summary
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 border border-slate-200/60 p-5 rounded-2xl">
          {report.overview}
        </p>
      </section>

      {/* SWOT Lists split - Styled as referrer pages traffic rows */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Left Column: Strengths / Growth Vectors (mimics Sources list) */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono flex items-center justify-between">
            <span>Growth Catalysts & Strengths</span>
            <span className="text-[9px] text-slate-400">Impact Weight</span>
          </h3>
          <div className="space-y-2">
            {report.strengths.map((str, idx) => {
              const weight = 95 - idx * 15; // Simulated decreasing weight bar
              return (
                <motion.div 
                  key={idx}
                  className="relative w-full p-3 rounded-lg overflow-hidden border border-slate-200/60 bg-slate-50/20"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.01, borderColor: "rgba(16, 185, 129, 0.4)" }}
                >
                  {/* Progress bar overlay backdrop */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/5 rounded-l-lg"
                    style={{ width: `${weight}%` }}
                  />
                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <span className="text-slate-700 pr-4">{str}</span>
                    <span className="text-emerald-600 font-mono text-[10px]">{weight}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Threats / Risk Vectors (mimics Pages list) */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono flex items-center justify-between">
            <span>Risk Exposures & Threats</span>
            <span className="text-[9px] text-slate-400">Exposure Index</span>
          </h3>
          <div className="space-y-2">
            {report.threats.map((thr, idx) => {
              const weight = 90 - idx * 12; // Simulated decreasing weight bar
              return (
                <motion.div 
                  key={idx}
                  className="relative w-full p-3 rounded-lg overflow-hidden border border-slate-200/60 bg-slate-50/20"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.01, borderColor: "rgba(239, 68, 68, 0.4)" }}
                >
                  {/* Progress bar overlay backdrop */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-rose-500/5 rounded-l-lg"
                    style={{ width: `${weight}%` }}
                  />
                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <span className="text-slate-700 pr-4">{thr}</span>
                    <span className="text-rose-600 font-mono text-[10px]">{weight}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Analyst Decision & Reasoning Section */}
      <motion.section 
        className="mt-8 bg-slate-50/40 border border-slate-200/80 rounded-2xl p-5 text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono flex items-center gap-1.5">
          <FiTrendingUp className="text-blue-500" />
          <span>Analyst Recommendation Context</span>
        </h4>
        <p className="text-slate-600 leading-relaxed text-xs md:text-sm">
          {report.reasoning}
        </p>
      </motion.section>
    </motion.div>
  );
};

export default ReportViewer;

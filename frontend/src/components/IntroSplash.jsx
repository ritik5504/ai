import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';

const IntroSplash = ({ onComplete }) => {
  // Automatically complete splash after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Framer Motion Animation Variants
  const logoVariants = {
    hidden: { scale: 0.3, opacity: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        duration: 1.2, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  const textVariants = {
    hidden: { opacity: 0, letterSpacing: "0.6em", filter: "blur(6px)" },
    visible: { 
      opacity: 1, 
      letterSpacing: "0.15em", 
      filter: "blur(0px)",
      transition: { 
        duration: 1.5, 
        delay: 0.4,
        ease: "easeOut" 
      } 
    }
  };

  const subVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        delay: 1.2,
        ease: "easeOut" 
      } 
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-[#050507] z-50 flex flex-col items-center justify-center select-none"
      exit={{ 
        y: "-100%",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
      }}
    >
      {/* Background Radial Glow */}
      <div className="absolute w-[450px] h-[450px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Floating Animated Circles */}
      <motion.div 
        className="absolute w-[180px] h-[180px] border border-blue-500/10 rounded-full"
        animate={{ scale: [1, 1.25, 1], rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      />
      <motion.div 
        className="absolute w-[300px] h-[300px] border border-slate-500/5 rounded-full"
        animate={{ scale: [1.1, 0.95, 1.1], rotate: -360 }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      />

      <div className="z-10 flex flex-col items-center gap-6">
        {/* Animated Brand Logo Icon */}
        <motion.div 
          className="p-4.5 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-blue-500/25 rounded-2xl shadow-[0_0_40px_rgba(0,102,255,0.15)] flex items-center justify-center cursor-pointer"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05 }}
        >
          <FiTrendingUp className="text-[#0066FF] text-4xl" />
        </motion.div>

        {/* Text Site Name Reveal */}
        <div className="text-center">
          <motion.h1 
            className="text-4xl sm:text-5xl font-black text-white uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-500 py-1"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            EquityIntel
          </motion.h1>
          <motion.p 
            className="text-xs text-gray-500 mt-2 font-mono uppercase tracking-widest"
            variants={subVariants}
            initial="hidden"
            animate="visible"
          >
            AI Investment Research Terminal
          </motion.p>
        </div>

        {/* Immediate Access Button */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          <motion.button
            onClick={onComplete}
            className="px-6 py-3 bg-white hover:bg-slate-200 text-[#050507] font-semibold text-xs tracking-widest uppercase rounded-xl border border-white/20 shadow-[0_4px_15px_rgba(255,255,255,0.1)] flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch Console
          </motion.button>
        </motion.div>
      </div>

      {/* Trailing Progress Tracker */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2.2 }}
      >
        <span className="text-[10px] text-[#555555] font-mono">ESTABLISHING CONNECTION</span>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
      </motion.div>
    </motion.div>
  );
};

export default IntroSplash;

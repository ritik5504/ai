import React, { useState } from 'react';
import { FiSearch, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SearchBox = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.form 
        onSubmit={handleSubmit} 
        className="relative flex items-center bg-[#0a0a0d] border border-neutral-800/80 rounded-2xl shadow-lg"
        whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.15)" }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-slate-500 text-xl" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter company name (e.g., Apple, Tesla, Nvidia)..."
          disabled={isLoading}
          className="w-full pl-12 pr-28 py-4 bg-transparent border-none rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
        />
        <motion.button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-6 py-2.5 bg-white hover:bg-slate-200 text-black font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <FiLoader className="animate-spin text-black" />
              <span>Analyzing</span>
            </>
          ) : (
            <span>Research</span>
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default SearchBox;

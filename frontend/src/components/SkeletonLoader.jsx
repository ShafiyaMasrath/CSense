import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl h-[300px] overflow-hidden relative">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent z-1"
          />
          <div className="flex justify-between mb-4">
            <div className="w-24 h-6 bg-slate-800 rounded-full" />
            <div className="w-16 h-6 bg-slate-800 rounded-full" />
          </div>
          <div className="w-3/4 h-8 bg-slate-800 rounded-lg mb-6" />
          <div className="space-y-3">
            <div className="w-full h-20 bg-slate-800/50 rounded-xl" />
            <div className="w-1/2 h-4 bg-slate-800/50 rounded-md" />
            <div className="w-2/3 h-4 bg-slate-800/50 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

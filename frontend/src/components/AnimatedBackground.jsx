import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#F6F8FB]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_55%,transparent_100%)] opacity-20"></div>

      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.12, 0.2, 0.12],
          x: [0, 18, 0],
          y: [0, 12, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#2563EB]/8 rounded-full blur-[90px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.08, 0.14, 0.08],
          x: [0, -24, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#2563EB]/5 rounded-full blur-[100px]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(15,23,42,0.02)_50%,transparent_100%)] bg-[size:100%_4px] pointer-events-none"></div>
    </div>
  );
};

export default AnimatedBackground;

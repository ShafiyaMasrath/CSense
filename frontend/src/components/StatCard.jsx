import React, { useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const StatCard = ({ label, value, subtext, icon: Icon, colorClass, delay = 0 }) => {
  const isDate = label?.toLowerCase().includes('date') || label?.toLowerCase().includes('renewal');
  const hasSuffix = typeof value === 'string' && (value.includes('M') || value.includes('K') || value.includes('%'));

  const numericValue = typeof value === 'number'
    ? value
    : parseFloat(value?.toString().replace(/[^0-9.-]/g, '')) || 0;

  const springConfig = { damping: 30, stiffness: 100 };
  const springValue = useSpring(0, springConfig);

  const displayValue = useTransform(springValue, (latest) => {
    if (isDate || hasSuffix) return value;

    const formatted = Math.round(latest);
    if (label?.toLowerCase().includes('arr')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(formatted);
    }
    return formatted.toLocaleString();
  });

  useEffect(() => {
    if (isDate || hasSuffix) return;

    const controls = animate(springValue, numericValue, {
      duration: 1.8,
      delay: delay + 0.2,
      ease: 'easeOut',
      onComplete: () => springValue.set(numericValue)
    });

    return () => controls.stop();
  }, [numericValue, springValue, delay, isDate, hasSuffix, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -2, boxShadow: '0 10px 24px rgba(2, 6, 23, 0.12)' }}
      className="group relative h-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
    >
      <div className="relative z-10 flex h-full items-start justify-between">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">{label}</p>
            <motion.h3 className={`mt-2 truncate text-2xl font-semibold tracking-tight ${colorClass || 'text-slate-900'}`}>
              {(isDate || hasSuffix) ? value : <motion.span>{displayValue}</motion.span>}
            </motion.h3>
          </div>
          {subtext && <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9CA3AF]">{subtext}</p>}
        </div>
        {Icon && (
          <div className="ml-4 flex h-fit shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 transition-colors group-hover:border-[#2563EB]/30 group-hover:bg-[#2563EB]/10">
            <Icon className="h-5 w-5 text-[#2563EB]" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
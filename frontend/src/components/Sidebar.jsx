import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, AlertCircle, CheckCircle, TrendingUp, UserCheck, Calendar, Briefcase } from 'lucide-react';

const Sidebar = ({ customers, activeCustomerId, onSelectCustomer }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Accounts');

  const filters = [
    { id: 'All Accounts', label: 'All Accounts', icon: Filter },
    { id: 'High Churn Risk', label: 'High Churn', icon: AlertCircle, color: 'text-red-500' },
    { id: 'Needs Attention', label: 'Needs Attention', icon: AlertCircle, color: 'text-yellow-500' },
    { id: 'Healthy Customers', label: 'Healthy', icon: CheckCircle, color: 'text-green-500' },
    { id: 'Upsell Candidate', label: 'Upsell Opps', icon: TrendingUp, color: 'text-blue-500' },
    { id: 'Champion Transition', label: 'Champion Changed', icon: UserCheck, color: 'text-purple-500' },
    { id: 'Renewals This Month', label: 'Renewals', icon: Calendar, color: 'text-orange-500' },
    { id: 'Enterprise', label: 'Enterprise', icon: Star, color: 'text-amber-500' },
  ];

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) || 
                            customer.industry.toLowerCase().includes(search.toLowerCase());
      
      let matchesFilter = true;
      if (activeFilter === 'High Churn Risk') matchesFilter = customer.account_status === 'High Churn Alert' || customer.health_score < 30;
      if (activeFilter === 'Needs Attention') matchesFilter = customer.account_status === 'At Risk' || (customer.health_score >= 30 && customer.health_score < 60);
      if (activeFilter === 'Healthy Customers') matchesFilter = customer.account_status === 'Healthy' || customer.health_score >= 80;
      if (activeFilter === 'Upsell Candidate') matchesFilter = customer.account_status === 'Upsell Candidate';
      if (activeFilter === 'Champion Transition') matchesFilter = customer.account_status === 'Champion Transition' || customer.account_status === 'Relationship Gap';
      if (activeFilter === 'Renewals This Month') matchesFilter = customer.renewal_date.includes('2026-07') || customer.renewal_date.includes('2026-06'); // Mocking "this month"
      if (activeFilter === 'Enterprise') matchesFilter = customer.subscription_plan.includes('Enterprise');

      return matchesSearch && matchesFilter;
    });
  }, [customers, search, activeFilter]);

  const getHealthColorClass = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="w-96 bg-[#F8FAFC] h-screen flex flex-col border-r border-[#E5E7EB] relative z-20">
      <div className="p-8 pb-4">
        <div className="mb-8 flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] shadow-[0_8px_20px_rgba(37,99,235,0.18)]">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">CSENSE</h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Enterprise CS</p>
          </div>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search companies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:border-[#2563EB]/40 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className={`flex items-center space-x-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  isActive 
                    ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_8px_16px_rgba(37,99,235,0.16)]' 
                    : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB]/30 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-white' : filter.color || 'text-slate-500'}`} />
                <span>{filter.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Account List */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-hide">
        <div className="space-y-2">
          <AnimatePresence mode='popLayout'>
            {filteredCustomers.map((customer) => (
              <motion.button
                layout
                initial={{ opacity: 0, x: -18, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: activeCustomerId === customer.id ? 1.01 : 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                whileHover={{ scale: 1.01, y: -1, boxShadow: '0 14px 24px rgba(15, 23, 42, 0.08)' }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
                className={`group relative w-full rounded-2xl border p-4 text-left transition-all ${
                  activeCustomerId === customer.id
                    ? 'border-[#2563EB] bg-[#2563EB] shadow-[0_12px_24px_rgba(37,99,235,0.18)]'
                    : 'border-transparent bg-white shadow-sm hover:border-[#BFDBFE] hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]'
                }`}
              >
                {activeCustomerId === customer.id && (
                  <motion.div layoutId="active-pill" className="absolute inset-0 rounded-2xl bg-white/10" />
                )}
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-base font-semibold ${
                    activeCustomerId === customer.id ? 'border-white/30 bg-white/15 text-white' : 'border-[#E5E7EB] bg-[#F9FAFB] text-slate-700'
                  }`}>
                    {getInitials(customer.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className={`truncate text-[15px] font-semibold ${activeCustomerId === customer.id ? 'text-white' : 'text-slate-900'}`}>
                          {customer.name}
                        </h3>
                        <p className={`mt-1 truncate text-[11px] font-medium uppercase tracking-[0.16em] ${activeCustomerId === customer.id ? 'text-blue-100' : 'text-slate-500'}`}>
                          {customer.industry}
                        </p>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${getHealthColorClass(customer.health_score)}`}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[11px] font-medium ${activeCustomerId === customer.id ? 'text-blue-100' : 'text-slate-500'}`}>
                        {customer.subscription_plan || 'Growth'}
                      </span>
                      <span className={`text-[11px] font-semibold ${activeCustomerId === customer.id ? 'text-white' : 'text-slate-700'}`}>
                        ${(customer.arr / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

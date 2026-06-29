import React from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import {
  Users,
  Target,
  Smartphone,
  Activity,
  Calendar,
  DollarSign,
  AlertTriangle,
  Zap,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import DecisionWorkspace from './DecisionWorkspace';

const tabs = ['Overview', 'Stakeholders', 'Product Usage', 'Engagement', 'Analysis'];

const Dashboard = ({
  customer,
  usage,
  tickets,
  contacts,
  aggregateStats,
  recommendations = [],
  riskAnalysis,
  devilReview,
  memory,
  isAnalyzing,
  error,
  onAnalyze
}) => {
  const [showWorkspace, setShowWorkspace] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Overview');
  const prevIsAnalyzing = React.useRef(isAnalyzing);

  // Animated KPI metric
  const AnimatedMetric = ({ value, className, formatter }) => {
    const motionValue = useMotionValue(0);
    const displayValue = useTransform(motionValue, (latest) => {
      const rounded = Math.round(latest);
      return typeof formatter === 'function' ? formatter(rounded) : String(rounded);
    });

    React.useEffect(() => {
      const numericValue =
        typeof value === 'number'
          ? value
          : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
      const controls = animate(motionValue, numericValue, { duration: 0.8, ease: 'easeOut' });
      return () => controls.stop();
    }, [value, motionValue]);

    return <motion.span className={className}>{displayValue}</motion.span>;
  };

  // Open workspace when analysis starts
  React.useEffect(() => {
    if (isAnalyzing && !prevIsAnalyzing.current) {
      setShowWorkspace(true);
      
    }
    prevIsAnalyzing.current = isAnalyzing;
  }, [isAnalyzing]);

  // Handle workspace completion: close and pulse dashboard
  const handleWorkspaceComplete = React.useCallback(() => {
    setShowWorkspace(false);
  }, []);

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent text-slate-500">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-6 opacity-10" />
          <p className="text-xl font-semibold tracking-tight text-slate-600">Select a company to review account health</p>
          <p className="text-sm text-slate-500 mt-2">Ready to analyze account performance</p>
        </motion.div>
      </div>
    );
  }

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-[#16A34A]';
    if (score >= 50) return 'text-[#D97706]';
    return 'text-[#DC2626]';
  };

  const getStatusBadge = (status) => {
    const classes = {
      Healthy: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
      'At Risk': 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20',
      'High Churn Alert': 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
      'Upsell Candidate': 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20',
      'Champion Transition': 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20',
      'Relationship Gap': 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20'
    };
    return classes[status] || 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
  };

  const formatARR = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const riskLevel = riskAnalysis?.churn_risk?.level || 'Review';
  const engagementTrend = usage?.usage_trend || 'No recent activity data';
  const recentConcern =
    devilReview?.reviews?.[0]?.counter_arguments?.[0]?.split('.')[0] ||
    'Champion engagement trends remain the primary watch item.';
  const nextAction = recommendations?.[0]?.title || 'Executive outreach within 7 days.';

  const summaryItems = [
    { label: 'Industry',   value: customer.industry },
    { label: 'Engagement', value: engagementTrend },
    { label: 'Renewal',    value: customer.renewal_date || 'Pending' },
    { label: 'ARR',        value: formatARR(customer.arr) }
  ];

  const kpiCards = [
    { label: 'Revenue at Risk', value: Math.max(0, customer.arr * 0.18), subtext: 'High', icon: DollarSign, colorClass: 'text-[#DC2626]', formatter: (v) => formatARR(v) },
    { label: 'Health Score',    value: customer.health_score,            subtext: 'Stable', icon: Activity, colorClass: getHealthColor(customer.health_score), formatter: (v) => `${v}` },
    { label: 'Product Adoption',value: Math.round((usage?.monthly_active_users || 72) / 100), subtext: 'Momentum', icon: Users, colorClass: 'text-[#2563EB]', formatter: (v) => `${v}%` },
    { label: 'Engagement',      value: usage?.monthly_active_users || 72, subtext: 'Live', icon: TrendingUp, colorClass: 'text-[#16A34A]', formatter: (v) => `${v} users` },
    { label: 'Support Tickets', value: tickets?.length || 3, subtext: 'Monitor', icon: AlertTriangle, colorClass: 'text-[#D97706]', formatter: (v) => `${v}` },
    { label: 'Renewal Countdown', value: 72, subtext: 'Urgent', icon: Calendar, colorClass: 'text-[#7C3AED]', formatter: (v) => `${v}d` }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Stakeholders':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Stakeholders</p>
                  <h3 className="text-base font-semibold text-slate-900">Champion and executive decision-maker</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Champion</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-semibold text-white">
                      {contacts?.champion ? contacts.champion[0] : 'V'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{contacts?.champion || 'Vacant'}</p>
                      <p className="text-sm text-slate-500">{contacts?.champion_email || 'No email registered'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-[#E5E7EB]">
                      <motion.div
                        className="h-2 rounded-full bg-[#16A34A]"
                        initial={{ width: 0 }}
                        animate={{ width: `${contacts?.champion_stability_score || 0}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{contacts?.champion_stability_score || 0}% stability</span>
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Decision maker</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-slate-500">
                      {contacts?.decision_maker ? contacts.decision_maker[0] : 'D'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{contacts?.decision_maker || 'Not appointed'}</p>
                      <p className="text-sm text-[#2563EB]">{contacts?.role || 'No executive role listed'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Product Usage':
        return (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Product usage</p>
                <h3 className="text-base font-semibold text-slate-900">Adoption by key capability</h3>
              </div>
            </div>
            <div className="space-y-4">
              {usage?.feature_adoption &&
                Object.entries(usage.feature_adoption).map(([feature, score]) => (
                  <div key={feature}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 capitalize">{feature}</span>
                      <span className="text-sm font-semibold text-slate-900">{(Number(score) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E5E7EB]">
                      <motion.div
                        className="h-2 rounded-full bg-[#2563EB]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Number(score) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              {!usage?.feature_adoption && (
                <p className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center text-sm text-slate-500">
                  No product usage data is available for this account.
                </p>
              )}
            </div>
          </div>
        );
      case 'Engagement':
        return (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Engagement</p>
                <h3 className="text-base font-semibold text-slate-900">Signals and support activity</h3>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Current trend</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{engagementTrend}</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Support activity</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{tickets?.length || 0} open or recent tickets</p>
              </div>
            </div>
          </div>
        );
      case 'Analysis':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Analysis</p>
                  <h3 className="text-base font-semibold text-slate-900">Review context and recommended next step</h3>
                </div>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-sm font-medium text-slate-700">{recentConcern}</p>
              </div>
              <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Recommended action</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{nextAction}</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Executive summary</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{customer.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">Managed by {customer.csm}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusBadge(customer.account_status)}`}>
                  {customer.account_status}
                </span>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Risk level</p>
                  <p className={`mt-2 text-lg font-semibold ${riskLevel === 'High' ? 'text-[#DC2626]' : riskLevel === 'Medium' ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                    {riskLevel}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Renewal</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{customer.renewal_date || 'Pending'}</p>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 md:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Key concern</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{recentConcern}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* ── Main Dashboard ── */}
      <motion.div
        className="flex-1 overflow-y-auto relative z-10 scrollbar-hide"
        animate={showWorkspace ? { scale: 0.97, opacity: 0.4, filter: 'blur(2px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="p-6 lg:p-10 max-w-[1700px] mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Customer success</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{customer.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-sm text-slate-700">{customer.industry}</span>
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-sm text-slate-700">CSM {customer.csm}</span>
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-sm text-slate-700">{customer.subscription_plan || 'Enterprise'}</span>
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-sm text-slate-700">Renewal {customer.renewal_date || 'Pending'}</span>
              </div>
            </div>
            <motion.button
              onClick={() => onAnalyze(customer.id)}
              disabled={isAnalyzing}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition-all hover:bg-[#1D4ED8] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none"
            >
              {isAnalyzing ? <Activity className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              <span>{isAnalyzing ? 'Generating AI strategy' : 'Run AI Analysis'}</span>
            </motion.button>
          </div>

          {/* Summary bar */}
          <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {summaryItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <div className="rounded-full bg-[#F9FAFB] px-3 py-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">{item.label}</span>
                    <span className="ml-2 font-medium text-slate-900">{item.value}</span>
                  </div>
                  {index < summaryItems.length - 1 && <span className="text-[#9CA3AF]">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* KPI Cards — re-animate on workspaceDone */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {kpiCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
                whileHover={{ y: -2, scale: 1.01, boxShadow: '0 10px 24px rgba(2,6,23,0.08)' }}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">{card.label}</p>
                    <AnimatedMetric
                      value={card.value}
                      formatter={card.formatter}
                      className={`mt-2 text-2xl font-semibold tracking-tight ${card.colorClass || 'text-slate-900'}`}
                    />
                  </div>
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-2.5">
                    <card.icon className="h-4 w-4 text-[#2563EB]" />
                  </div>
                </div>
                <p className="mt-3 text-[11px] font-medium text-[#9CA3AF]">{card.subtext}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs + Decision Center */}
          <AnimatePresence mode="wait">
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex flex-col xl:flex-row gap-6"
            >
              <div className="flex-1">
                <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      whileHover={{ y: -1, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {tab}
                    </motion.button>
                  ))}
                </div>
                {renderTabContent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Decision Workspace overlay ── */}
      <AnimatePresence>
        {showWorkspace && (
          <DecisionWorkspace
            isAnalyzing={isAnalyzing}
            customer={customer}
            riskAnalysis={riskAnalysis}
            recommendations={recommendations}
            devilReview={devilReview}
            onComplete={handleWorkspaceComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
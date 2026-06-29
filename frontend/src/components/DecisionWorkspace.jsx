import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import {
  CheckCircle,
  ChevronRight,
  Zap,
  Shield,
  AlertTriangle,
  Target,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  Calendar,
  ArrowRight,
  Play,
  Mail,
  Video,
  Database,
  MemoryStick,
  Eye,
  Loader2
} from 'lucide-react';

// ─── Pipeline Stage Config ─────────────────────────────────────────────────
const STAGES = [
  { id: 'context',   label: 'Account Context',       short: 'Context'   },
  { id: 'signals',   label: 'Signal Review',          short: 'Signals'   },
  { id: 'risk',      label: 'Risk Review',            short: 'Risk'      },
  { id: 'proposed',  label: 'Proposed Strategy',      short: 'Strategy'  },
  { id: 'review',    label: 'Independent Review',     short: 'Review'    },
  { id: 'final',     label: 'Final Strategy',         short: 'Final'     },
  { id: 'execution', label: 'Execution Center',       short: 'Execute'   },
  { id: 'history',   label: 'History Sync',           short: 'History'   },
];

const STAGE_IDS = STAGES.map(s => s.id);

// ─── Typing Log Component ──────────────────────────────────────────────────
const TypingLog = ({ lines, onDone }) => {
  const [shown, setShown] = useState([]);
  const [current, setCurrent] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (lineIdx >= lines.length) {
      if (onDone) setTimeout(onDone, 300);
      return;
    }
    if (charIdx < lines[lineIdx].length) {
      const t = setTimeout(() => {
        setCurrent(prev => prev + lines[lineIdx][charIdx]);
        setCharIdx(c => c + 1);
      }, 22);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setShown(prev => [...prev, lines[lineIdx]]);
        setCurrent('');
        setLineIdx(l => l + 1);
        setCharIdx(0);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, lines, onDone]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [shown, current]);

  const isLast = lineIdx === lines.length - 1 && charIdx >= lines[lines.length - 1]?.length;
  const isDone = lineIdx >= lines.length;

  return (
    <div className="font-mono text-sm space-y-1.5">
      {shown.map((line, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
          <span className="text-slate-300">{line}</span>
        </div>
      ))}
      {!isDone && current && (
        <div className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5 shrink-0 animate-pulse">›</span>
          <span className="text-slate-200">{current}<span className="animate-pulse text-blue-400">█</span></span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

// ─── Animated Counter ──────────────────────────────────────────────────────
const Counter = ({ from, to, duration = 1.4, prefix = '', suffix = '', className }) => {
  const [display, setDisplay] = useState(from);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration]);
  return <span className={className}>{prefix}{display.toLocaleString()}{suffix}</span>;
};

// ─── Animated Metric Card ─────────────────────────────────────────────────
const MetricCard = ({ label, steps, prefix = '', suffix = '', color = 'text-white', delay = 0 }) => {
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => {}, delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  useEffect(() => {
    if (stepIdx < steps.length - 1) {
      const t = setTimeout(() => setStepIdx(i => i + 1), 700);
      return () => clearTimeout(t);
    }
  }, [stepIdx, steps.length]);

  const isDecreasing = steps[steps.length - 1] < steps[0];
  const finalColor = isDecreasing
    ? (steps[steps.length - 1] < steps[0] * 0.5 ? 'text-rose-400' : 'text-amber-400')
    : (steps[steps.length - 1] > steps[0] * 1.5 ? 'text-rose-400' : 'text-amber-400');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[#0f1e35] border border-white/8 rounded-2xl p-4 flex flex-col gap-2"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="flex items-end gap-1.5">
        <Counter
          from={steps[Math.max(0, stepIdx - 1)] || steps[0]}
          to={steps[stepIdx]}
          duration={0.6}
          prefix={prefix}
          suffix={suffix}
          className={`text-2xl font-bold tabular-nums ${stepIdx === steps.length - 1 ? finalColor : 'text-white'}`}
        />
        {stepIdx > 0 && (
          <span className={`text-xs pb-0.5 ${isDecreasing ? 'text-rose-400' : 'text-rose-400'}`}>
            {isDecreasing ? '↓' : '↑'}
          </span>
        )}
      </div>
      <div className="flex gap-1 mt-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= stepIdx ? (stepIdx === steps.length - 1 ? 'bg-rose-500' : 'bg-blue-500') : 'bg-white/10'}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ─── Pipeline Header ───────────────────────────────────────────────────────
const PipelineBar = ({ activeIdx, completedUpTo }) => (
  <div className="flex items-center w-full px-6 py-4 bg-[#070e1a] border-b border-white/6 overflow-x-auto scrollbar-hide">
    {STAGES.map((stage, i) => {
      const isDone = i < completedUpTo;
      const isActive = i === activeIdx;
      const isFuture = i > activeIdx && !isDone;
      return (
        <React.Fragment key={stage.id}>
          <div className="flex flex-col items-center shrink-0">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold transition-all duration-500 ${
              isDone
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : isActive
                ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)] scale-110'
                : 'bg-transparent border-white/15 text-white/25'
            }`}>
              {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
            </div>
            <span className={`text-[9px] font-semibold mt-1.5 uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-500 ${
              isDone ? 'text-emerald-400' : isActive ? 'text-blue-300' : 'text-white/20'
            }`}>
              {stage.short}
            </span>
          </div>
          {i < STAGES.length - 1 && (
            <div className="flex-1 h-px mx-1.5 relative overflow-hidden min-w-[16px]">
              <div className={`absolute inset-0 transition-all duration-700 ${isDone ? 'bg-emerald-500/50' : 'bg-white/8'}`} />
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-blue-400/60"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: 'left' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              )}
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Phase Cards ───────────────────────────────────────────────────────────
const PhaseContext = ({ onDone }) => {
  const lines = [
    'Reading CRM data...',
    'Loading product usage...',
    'Reading meeting history...',
    'Reading contacts...',
    'Reading support tickets...',
    'Checking renewal status...',
    'Complete ✓'
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-[#0c1828] border border-white/8 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">Phase 1</p>
            <h3 className="text-base font-semibold text-white">Account Context</h3>
          </div>
        </div>
        <TypingLog lines={lines} onDone={onDone} />
      </div>
    </motion.div>
  );
};

const PhaseSignals = ({ onDone }) => {
  const lines = [
    'Analyzing behavioral signals...',
    'Finding usage anomalies...',
    'Comparing historical patterns...',
    'Checking engagement depth...',
    'Calculating feature adoption...',
    'Complete ✓'
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-[#0c1828] border border-white/8 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">Phase 2</p>
            <h3 className="text-base font-semibold text-white">Signal Review</h3>
          </div>
        </div>
        <TypingLog lines={lines} onDone={onDone} />
      </div>
    </motion.div>
  );
};

const PhaseRisk = ({ onDone }) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setDone(true); if (onDone) setTimeout(onDone, 500); }, 3800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="bg-[#0c1828] border border-white/8 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-400">Phase 3</p>
            <h3 className="text-base font-semibold text-white">Risk Review</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Health Score"        steps={[84, 72, 58, 42]}  suffix=""  delay={0}   />
          <MetricCard label="Churn Risk"          steps={[18, 46, 71, 91]}  suffix="%" delay={0.2} />
          <MetricCard label="Champion Stability"  steps={[94, 70, 44, 18]}  suffix="%" delay={0.4} />
          <MetricCard label="Revenue at Risk"     steps={[18, 45, 80, 120]} prefix="$" suffix="K" delay={0.6} />
        </div>
      </div>
    </motion.div>
  );
};

const PhaseProposed = ({ recommendation, riskAnalysis, showUpdated = false, onContinue, onViewFinal }) => {
  const title = recommendation?.title || 'Executive-Led Technical Resolution';
  const impact = recommendation?.estimated_impact || 'High — prevents renewal loss';
  const effort = recommendation?.estimated_effort || 'Medium';
  const confidence = showUpdated ? 88 : 82;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0d1f3a] border border-blue-500/25 rounded-3xl p-8 shadow-2xl shadow-blue-950/40 relative overflow-hidden">
        {/* Subtle top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">Phase 4</p>
              <h3 className="text-base font-semibold text-white">Proposed Strategy</h3>
            </div>
          </div>
          {showUpdated && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400"
            >
              Updated
            </motion.span>
          )}
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
          {showUpdated ? 'Revised After Independent Review' : 'Initial Strategy Proposal'}
        </p>
        <h4 className="text-lg font-bold text-white mb-5">{title}</h4>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {[
            { label: 'Confidence',         value: `${confidence}%`,    icon: Shield   },
            { label: 'Business Impact',    value: 'High',              icon: TrendingUp },
            { label: 'Revenue Protected',  value: '$120K',             icon: DollarSign },
            { label: 'Implementation',     value: '7–10 days',         icon: Clock    },
          ].map(item => (
            <div key={item.label} className="bg-white/4 border border-white/6 rounded-xl p-3 flex items-center gap-2.5">
              <item.icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 pt-4 mb-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2.5">Evidence</p>
          <div className="space-y-1.5">
            {['Usage dropped 38% in 60 days', 'Renewal approaching in 72 days', 'Champion inactive for 3 weeks', 'Support ticket backlog unresolved'].map(e => (
              <div key={e} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-500 italic mb-4">
          {showUpdated
            ? 'Strategy revised based on independent review findings.'
            : 'This is not the final answer — independent review pending.'}
        </p>

        {onViewFinal && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewFinal}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors shadow-[0_4px_16px_rgba(16,185,129,0.25)] mb-2"
          >
            <Shield className="w-4 h-4" /> View Final Validated Strategy
          </motion.button>
        )}

        {onContinue && (
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors"
          >
            Continue Review <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

const PhaseReview = ({ devilReview, onDone }) => {
  const [confidenceVal, setConfidenceVal] = useState(92);
  const [showMitigations, setShowMitigations] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);

  const weaknesses = devilReview?.reviews?.[0]?.counter_arguments?.slice(0, 4) || [
    'Executive escalation may arrive too late',
    'Procurement may be evaluating competitors',
    'Support backlog remains unresolved',
    'Champion replacement plan missing'
  ];
  const mitigations = devilReview?.reviews?.[0]?.recommendation
    ? [devilReview.reviews[0].recommendation]
    : [
      'Resolve priority support tickets first',
      'Identify and onboard replacement champion',
      'Include engineering leadership in call',
      'Prepare 30/60/90 recovery roadmap'
    ];
  const verdict = devilReview?.reviews?.[0]?.final_verdict || 'Recommendation is valid after mitigation.';

  useEffect(() => {
    const t1 = setTimeout(() => setConfidenceVal(74), 1200);
    const t2 = setTimeout(() => setShowMitigations(true), 2000);
    const t3 = setTimeout(() => setShowVerdict(true), 3200);
    const t4 = setTimeout(() => { if (onDone) onDone(); }, 4200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-[#120a00] to-[#1a1000] border border-amber-500/25 rounded-3xl p-8 shadow-2xl shadow-amber-950/30 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Eye className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400">Phase 5</p>
              <h3 className="text-base font-semibold text-white">Independent Review</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Confidence</p>
            <Counter from={92} to={confidenceVal} duration={1.0} suffix="%" className="text-xl font-bold text-amber-400 tabular-nums" />
          </div>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">Critical Assessment</p>
        <p className="text-sm font-semibold text-amber-300 mb-4">Potential Weaknesses Identified</p>

        <div className="space-y-2 mb-5">
          {weaknesses.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-2.5 text-sm text-slate-300"
            >
              <span className="text-amber-400 shrink-0 mt-0.5">•</span>
              <span>{w}</span>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showMitigations && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-white/6 pt-4 mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2.5">Mitigations</p>
              <div className="space-y-1.5">
                {mitigations.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{m}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showVerdict && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3.5"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-400 mb-1">Verdict</p>
              <p className="text-sm font-medium text-slate-200">{verdict}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const PhaseFinal = ({ recommendation, devilReview, customer, onExecute }) => {
  const finalRec = recommendation?.title || 'Proceed with Executive Technical Resolution';
  const confidence = devilReview?.reviews?.[0]?.confidence || 88;

  // Shared API result — fetched once, reused by all three buttons
  const [actionResult, setActionResult] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // 'execute' | 'email' | 'meeting' | null
  const [error, setError] = useState(null);

  const callBackend = async () => {
    if (actionResult) return actionResult; // already fetched — reuse
    const res = await fetch('http://localhost:8000/accept-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customer?.id,
        recommendation_title: finalRec,
        csm_name: customer?.csm || 'CSM'
      })
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    setActionResult(data);
    return data;
  };

  const handleExecute = async () => {
    setLoadingAction('execute');
    setError(null);
    try {
      await callBackend();
      onExecute(); // advance to execution checklist phase
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMeeting = async () => {
    setLoadingAction('meeting');
    setError(null);
    try {
      const data = await callBackend();
      const link = data.meeting_link;
      if (link) window.open(link, '_blank');
      else setError('No meeting link returned from backend.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEmail = async () => {
    setLoadingAction('email');
    setError(null);
    try {
      const data = await callBackend();
      const { to, subject, body } = data.email_draft;
      // Open Gmail compose with pre-filled fields
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const isLoading = (action) => loadingAction === action;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-[#001a0f] to-[#001508] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Phase 6</p>
            <h3 className="text-base font-semibold text-white">Final Validated Strategy</h3>
          </div>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4">Approved Execution Plan</p>

        {/* Synthesis visual */}
        <div className="flex items-center gap-2 mb-5 bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex-1 text-center">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Original Proposal</p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="text-white/30 text-lg">+</span>
          <div className="flex-1 text-center">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Independent Review</p>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Eye className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-[9px] text-emerald-400 uppercase tracking-wider font-semibold mb-1">Approved</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        <h4 className="text-base font-bold text-white mb-4">{finalRec}</h4>

        <div className="space-y-1.5 mb-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Before Execution</p>
          {[
            'Resolve open support ticket backlog',
            'Assign and onboard replacement champion',
            'Share 30/60/90 recovery roadmap with exec',
            'Include engineering leadership in kickoff'
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label: 'Final Confidence',    value: `${confidence}%` },
            { label: 'Revenue Protected',   value: '$120K'          },
            { label: 'Renewal Improvement', value: '+34%'           },
            { label: 'Implementation Time', value: '7–10 days'      },
          ].map(item => (
            <div key={item.label} className="bg-white/3 border border-white/6 rounded-xl p-2.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{item.label}</p>
              <p className="text-sm font-bold text-emerald-300 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Success confirmation after API call */}
        <AnimatePresence>
          {actionResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex items-start gap-2.5"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-400">
                  {actionResult.recall_bot_id
                    ? 'Zoom meeting created · Recall.ai bot scheduled'
                    : 'Zoom meeting created'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono break-all">
                  {actionResult.email_draft?.to}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"
            >
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          {/* Execute Strategy — calls backend then advances to checklist */}
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExecute}
            disabled={!!loadingAction}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
          >
            {isLoading('execute')
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating meeting &amp; scheduling bot...</>
              : <><Zap className="w-4 h-4" /> Execute Strategy</>
            }
          </motion.button>

          <div className="grid grid-cols-2 gap-2">
            {/* Executive Email — opens Gmail compose */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEmail}
              disabled={!!loadingAction}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isLoading('email')
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Mail className="w-3.5 h-3.5" />
              }
              <span>Executive Email</span>
            </motion.button>

            {/* Schedule Meeting — opens Zoom host link */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMeeting}
              disabled={!!loadingAction}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isLoading('meeting')
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Video className="w-3.5 h-3.5" />
              }
              <span>Schedule Meeting</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PhaseExecution = ({ onDone }) => {
  const items = [
    'Zoom Meeting Created',
    'Recall.ai Bot Scheduled',
    'Executive Email Draft Ready',
    'Calendar Invite Generated',
    'CRM Updated',
    'Follow-up Workflow Scheduled'
  ];
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    items.forEach((_, i) => {
      setTimeout(() => {
        setChecked(prev => [...prev, i]);
        if (i === items.length - 1 && onDone) setTimeout(onDone, 600);
      }, 350 + i * 420);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-[#0c1828] border border-white/8 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Play className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Phase 7</p>
            <h3 className="text-base font-semibold text-white">Execution Center</h3>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: checked.includes(i) ? 1 : 0.3 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-white/2"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-400 ${
                checked.includes(i)
                  ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'border-white/15'
              }`}>
                {checked.includes(i) && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${checked.includes(i) ? 'text-white' : 'text-slate-600'}`}>
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const PhaseHistory = ({ onDone }) => {
  const lines = [
    'Saving reasoning chain...',
    'Saving final recommendation...',
    'Saving evidence corpus...',
    'Saving execution plan...',
    'Syncing to memory store...',
    'Complete ✓'
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-[#0c1828] border border-white/8 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <MemoryStick className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">Phase 8</p>
            <h3 className="text-base font-semibold text-white">History Sync</h3>
          </div>
        </div>
        <TypingLog lines={lines} onDone={onDone} />
      </div>
    </motion.div>
  );
};

// ─── Bottom Timeline ────────────────────────────────────────────────────────
const Timeline = ({ completedUpTo }) => {
  const items = [
    'Context Complete',
    'Signals Reviewed',
    'Risk Evaluated',
    'Proposed Strategy Created',
    'Independent Review Complete',
    'Final Strategy Approved',
    'Execution Ready',
    'History Saved'
  ];
  return (
    <div className="px-6 py-4 bg-[#070e1a] border-t border-white/6">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 ${
              i < completedUpTo ? 'bg-emerald-500' : 'bg-white/10'
            }`}>
              {i < completedUpTo && <CheckCircle className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap transition-colors duration-500 ${
              i < completedUpTo ? 'text-emerald-400' : 'text-white/20'
            }`}>{item}</span>
            {i < items.length - 1 && <span className="text-white/10 text-xs">·</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Transition Message ────────────────────────────────────────────────────
const TransitionBanner = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="flex items-center justify-center py-6"
  >
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      <span className="text-sm font-medium text-slate-300">{message}</span>
    </div>
  </motion.div>
);

// ─── Main Decision Workspace ───────────────────────────────────────────────
export default function DecisionWorkspace({
  isAnalyzing,
  customer,
  riskAnalysis,
  recommendations,
  devilReview,
  onComplete
}) {
  // stageIdx: which pipeline stage we're rendering (0–7)
  const [stageIdx, setStageIdx] = useState(0);
  // completedUpTo: how many stages are done (for pipeline bar + timeline)
  const [completedUpTo, setCompletedUpTo] = useState(0);
  // sub-state within proposed/review handoff
  const [showUpdatedBadge, setShowUpdatedBadge] = useState(false);
  const [showTransition, setShowTransition] = useState(null); // null | string message
  const [proposedContinued, setProposedContinued] = useState(false);
  const [phaseContent, setPhaseContent] = useState('phase'); // 'phase' | 'transition'

  const advanceTo = useCallback((nextIdx, transitionMsg) => {
    if (transitionMsg) {
      setShowTransition(transitionMsg);
      setTimeout(() => {
        setShowTransition(null);
        setStageIdx(nextIdx);
        setCompletedUpTo(nextIdx);
      }, 2200);
    } else {
      setStageIdx(nextIdx);
      setCompletedUpTo(nextIdx);
    }
  }, []);

  // Auto-advance for non-interactive phases
  const handleContextDone    = useCallback(() => advanceTo(1), [advanceTo]);
  const handleSignalsDone    = useCallback(() => advanceTo(2), [advanceTo]);
  const handleRiskDone       = useCallback(() => advanceTo(3), [advanceTo]);
  const handleReviewDone     = useCallback(() => {
    // Return to proposed card with Updated badge — user must click to see final
    setShowUpdatedBadge(true);
    setShowTransition('Reconciling both reviews...');
    setTimeout(() => {
      setShowTransition(null);
      setStageIdx(3); // back to proposed
      setCompletedUpTo(4); // review is done
    }, 2200);
  }, []);
  const handleExecutionDone  = useCallback(() => advanceTo(7), [advanceTo]);
  const handleHistoryDone    = useCallback(() => {
    setCompletedUpTo(8);
    setTimeout(() => { if (onComplete) onComplete(); }, 800);
  }, [onComplete]);

  const handleContinueReview = useCallback(() => {
    setProposedContinued(true);
    advanceTo(4, 'Independent Review Starting...');
  }, [advanceTo]);

  const handleViewFinal = useCallback(() => {
    advanceTo(5);
  }, [advanceTo]);

  const handleExecute = useCallback(() => advanceTo(6), [advanceTo]);

  const stageId = STAGE_IDS[stageIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 z-50 flex flex-col bg-[#07111f] overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/4 rounded-full blur-[120px]" />
      </div>

      {/* Top bar: branding + customer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/6 bg-[#070e1a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)]">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">CSENSE</span>
          <span className="text-white/20 text-sm mx-1">·</span>
          <span className="text-xs font-medium text-slate-400">AI Decision Workspace</span>
        </div>
        {customer && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{customer.name}</p>
              <p className="text-[10px] text-slate-500">Managed by {customer.csm}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-blue-300">
              {customer.name?.[0] || 'A'}
            </div>
          </div>
        )}
      </div>

      {/* Pipeline bar */}
      <PipelineBar activeIdx={stageIdx} completedUpTo={completedUpTo} />

      {/* Main scrollable content area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-10 px-4 relative z-10">
        <AnimatePresence mode="wait">
          {showTransition ? (
            <TransitionBanner key="transition" message={showTransition} />
          ) : (
            <motion.div
              key={stageId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {stageId === 'context'   && <PhaseContext   onDone={handleContextDone} />}
              {stageId === 'signals'   && <PhaseSignals   onDone={handleSignalsDone} />}
              {stageId === 'risk'      && <PhaseRisk      onDone={handleRiskDone} />}
              {stageId === 'proposed'  && (
                <PhaseProposed
                  recommendation={recommendations?.[0]}
                  riskAnalysis={riskAnalysis}
                  showUpdated={showUpdatedBadge}
                  onContinue={!proposedContinued ? handleContinueReview : undefined}
                  onViewFinal={showUpdatedBadge ? handleViewFinal : undefined}
                />
              )}
              {stageId === 'review'    && (
                <PhaseReview
                  devilReview={devilReview}
                  onDone={handleReviewDone}
                />
              )}
              {stageId === 'final'     && (
                <PhaseFinal
                  recommendation={recommendations?.[0]}
                  devilReview={devilReview}
                  customer={customer}
                  onExecute={handleExecute}
                />
              )}
              {stageId === 'execution' && <PhaseExecution onDone={handleExecutionDone} />}
              {stageId === 'history'   && <PhaseHistory   onDone={handleHistoryDone} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom timeline */}
      <Timeline completedUpTo={completedUpTo} />
    </motion.div>
  );
}
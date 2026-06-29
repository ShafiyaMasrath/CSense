import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  BrainCircuit, 
  Database, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  CheckCircle,
  Activity,
  Terminal,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';

// Node Coordinates in SVG ViewBox (1100 x 220)
const NODE_POSITIONS = {
  planner: { x: 100, y: 110 },
  context: { x: 280, y: 110 },
  risk: { x: 460, y: 110 },
  recommendation: { x: 640, y: 110 },
  confidence: { x: 820, y: 110 },
  memory: { x: 1000, y: 110 }
};

// Glow color configurations for active and completed states
const GLOW_COLORS = {
  planner: 'rgba(59, 130, 246, 0.5)',
  context: 'rgba(139, 92, 246, 0.5)',
  risk: 'rgba(244, 63, 94, 0.5)',
  recommendation: 'rgba(245, 158, 11, 0.5)',
  confidence: 'rgba(16, 185, 129, 0.5)',
  memory: 'rgba(99, 102, 241, 0.5)'
};

// Bezier Control points for curved paths between nodes (gentle arches)
const PATHS = {
  plannerToContext: {
    p0: NODE_POSITIONS.planner,
    p1: { x: NODE_POSITIONS.planner.x + 60, y: NODE_POSITIONS.planner.y - 15 },
    p2: { x: NODE_POSITIONS.context.x - 60, y: NODE_POSITIONS.context.y - 15 },
    p3: NODE_POSITIONS.context
  },
  contextToRisk: {
    p0: NODE_POSITIONS.context,
    p1: { x: NODE_POSITIONS.context.x + 60, y: NODE_POSITIONS.context.y - 15 },
    p2: { x: NODE_POSITIONS.risk.x - 60, y: NODE_POSITIONS.risk.y - 15 },
    p3: NODE_POSITIONS.risk
  },
  riskToRecommendation: {
    p0: NODE_POSITIONS.risk,
    p1: { x: NODE_POSITIONS.risk.x + 60, y: NODE_POSITIONS.risk.y - 15 },
    p2: { x: NODE_POSITIONS.recommendation.x - 60, y: NODE_POSITIONS.recommendation.y - 15 },
    p3: NODE_POSITIONS.recommendation
  },
  recommendationToConfidence: {
    p0: NODE_POSITIONS.recommendation,
    p1: { x: NODE_POSITIONS.recommendation.x + 60, y: NODE_POSITIONS.recommendation.y - 15 },
    p2: { x: NODE_POSITIONS.confidence.x - 60, y: NODE_POSITIONS.confidence.y - 15 },
    p3: NODE_POSITIONS.confidence
  },
  confidenceToMemory: {
    p0: NODE_POSITIONS.confidence,
    p1: { x: NODE_POSITIONS.confidence.x + 60, y: NODE_POSITIONS.confidence.y - 15 },
    p2: { x: NODE_POSITIONS.memory.x - 60, y: NODE_POSITIONS.memory.y - 15 },
    p3: NODE_POSITIONS.memory
  }
};

const getBezierPathString = (path) => {
  return `M ${path.p0.x} ${path.p0.y} C ${path.p1.x} ${path.p1.y}, ${path.p2.x} ${path.p2.y}, ${path.p3.x} ${path.p3.y}`;
};

// Flowing Particle Component along a cubic Bezier path
const FlowingParticle = ({ path, active, color, delay = 0 }) => {
  const t = useMotionValue(0);

  useEffect(() => {
    if (active) {
      const controls = animate(t, 1, {
        duration: 0.6,
        ease: 'linear',
        repeat: Infinity,
        delay: delay
      });
      return () => controls.stop();
    } else {
      t.set(0);
    }
  }, [active, delay]);

  const x = useTransform(t, val => {
    const mt = 1 - val;
    return mt * mt * mt * path.p0.x + 3 * mt * mt * val * path.p1.x + 3 * mt * val * val * path.p2.x + val * val * val * path.p3.x;
  });

  const y = useTransform(t, val => {
    const mt = 1 - val;
    return mt * mt * mt * path.p0.y + 3 * mt * mt * val * path.p1.y + 3 * mt * val * val * path.p2.y + val * val * val * path.p3.y;
  });

  if (!active) return null;

  return (
    <g>
      {/* Outer Glow */}
      <motion.circle cx={x} cy={y} r={9} fill={color} className="opacity-35 blur-[3px]" />
      {/* Mid Glow */}
      <motion.circle cx={x} cy={y} r={6} fill={color} className="opacity-60 blur-[1px]" />
      {/* Inner Core */}
      <motion.circle cx={x} cy={y} r={3} fill="#ffffff" />
    </g>
  );
};

// Component for a complete Connection (static glowing path + flowing particles)
const SVGConnection = ({ path, active, completed, color }) => {
  const pathString = getBezierPathString(path);
  return (
    <g>
      {/* Background glow path */}
      <path
        d={pathString}
        fill="none"
        stroke={completed ? color : '#1e293b'}
        strokeWidth={completed ? 5 : 2}
        className="transition-all duration-700 ease-in-out opacity-25 blur-[3px]"
      />
      {/* Base line path */}
      <path
        d={pathString}
        fill="none"
        stroke={completed ? color : '#334155'}
        strokeWidth={1.5}
        className="transition-all duration-700 ease-in-out"
        strokeDasharray={!completed && !active ? '5,5' : 'none'}
      />
      {/* Flowing Staggered Particles */}
      <FlowingParticle path={path} active={active} color={color} delay={0} />
      <FlowingParticle path={path} active={active} color={color} delay={0.15} />
      <FlowingParticle path={path} active={active} color={color} delay={0.3} />
    </g>
  );
};

export default function AgentOrchestrator2D({
  isAnalyzing,
  customer,
  riskAnalysis,
  recommendations,
  devilReview,
  onComplete
}) {
  const [sequenceState, setSequenceState] = useState('IDLE');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const consoleBottomRef = useRef(null);

  // Initialize and run states
  useEffect(() => {
    if (isAnalyzing && sequenceState === 'IDLE') {
      setSequenceState('PLANNER');
    }
  }, [isAnalyzing, sequenceState]);

  useEffect(() => {
    let timeout;

    if (sequenceState === 'PLANNER') {
      addLog('Reviewing CRM engagement history...');
      timeout = setTimeout(() => setSequenceState('CONTEXT'), 2400);
    } else if (sequenceState === 'CONTEXT') {
      addLog('Refreshing account telemetry...');
      timeout = setTimeout(() => setSequenceState('RISK'), 2400);
    } else if (sequenceState === 'RISK') {
      addLog('Assessing renewal risk indicators...');
      timeout = setTimeout(() => setSequenceState('RECOMMENDATION_PROCESSING'), 2600);
    } else if (sequenceState === 'RECOMMENDATION_PROCESSING') {
      addLog('Comparing account signals against benchmarks...');
      if (!isAnalyzing) {
        if (recommendations && recommendations.length > 0) {
          timeout = setTimeout(() => setSequenceState('RECOMMENDATION_READY'), 2400);
        } else {
          onComplete();
        }
      }
    } else if (sequenceState === 'RECOMMENDATION_READY') {
      addLog('Preparing recommended interventions...');
      timeout = setTimeout(() => setSequenceState('CONFIDENCE_VALIDATING'), 2200);
    } else if (sequenceState === 'CONFIDENCE_VALIDATING') {
      addLog('Running independent review checks...');
      timeout = setTimeout(() => setSequenceState('CONFIDENCE_READY'), 2600);
    } else if (sequenceState === 'CONFIDENCE_READY') {
      addLog('Finalizing the account assessment...');
      timeout = setTimeout(() => setSequenceState('MEMORY_READY'), 2200);
    } else if (sequenceState === 'MEMORY_READY') {
      addLog('Archiving account context for future reviews...');
      timeout = setTimeout(() => {
        setSequenceState('COMPLETE');
      }, 1800);
    } else if (sequenceState === 'COMPLETE') {
      addLog('Account review complete.');
      onComplete();
    }

    return () => clearTimeout(timeout);
  }, [sequenceState, isAnalyzing, recommendations, onComplete]);

  // Keep logs visible and scrolled to bottom
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setConsoleLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Node States mapping based on sequence
  const nodeStates = {
    planner: sequenceState === 'PLANNER' ? 'processing' : sequenceState !== 'IDLE' ? 'complete' : 'inactive',
    context: sequenceState === 'CONTEXT' ? 'processing' : ['RISK', 'RECOMMENDATION_PROCESSING', 'RECOMMENDATION_READY', 'CONFIDENCE_VALIDATING', 'CONFIDENCE_READY', 'MEMORY_READY', 'COMPLETE'].includes(sequenceState) ? 'complete' : 'inactive',
    risk: sequenceState === 'RISK' ? 'processing' : ['RECOMMENDATION_PROCESSING', 'RECOMMENDATION_READY', 'CONFIDENCE_VALIDATING', 'CONFIDENCE_READY', 'MEMORY_READY', 'COMPLETE'].includes(sequenceState) ? 'complete' : 'inactive',
    recommendation: sequenceState === 'RECOMMENDATION_PROCESSING' ? 'processing' : ['RECOMMENDATION_READY', 'CONFIDENCE_VALIDATING', 'CONFIDENCE_READY', 'MEMORY_READY', 'COMPLETE'].includes(sequenceState) ? 'complete' : 'inactive',
    confidence: sequenceState === 'CONFIDENCE_VALIDATING' ? 'processing' : ['CONFIDENCE_READY', 'MEMORY_READY', 'COMPLETE'].includes(sequenceState) ? (devilReview?.reviews?.[0]?.confidence > 70 ? 'complete' : 'warning') : 'inactive',
    memory: sequenceState === 'MEMORY_READY' ? 'processing' : sequenceState === 'COMPLETE' ? 'complete' : 'inactive'
  };

  // Color constants
  const COLORS = {
    planner: 'from-blue-600 to-cyan-500',
    context: 'from-purple-600 to-indigo-500',
    risk: 'from-pink-600 to-rose-500',
    recommendation: 'from-amber-500 to-orange-500',
    confidence: 'from-emerald-500 to-teal-500',
    memory: 'from-indigo-600 to-violet-500'
  };

  const getStatusIcon = (state, defaultIcon) => {
    if (state === 'processing') return <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />;
    if (state === 'complete') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />;
    if (state === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
    return defaultIcon;
  };

  const renderNode = (nodeId, label, subtext, Icon, defaultIcon) => {
    const state = nodeStates[nodeId];
    const colorClass = COLORS[nodeId];
    const glowColor = GLOW_COLORS[nodeId];
    const position = NODE_POSITIONS[nodeId];

    let borderStyle = 'border-[#243244] bg-[#0D1728]/90 text-white/55';
    let glowStyle = {};

    if (state === 'processing') {
      borderStyle = 'border-transparent text-white';
      glowStyle = {
        boxShadow: `0 0 14px ${glowColor}`,
        borderColor: 'transparent'
      };
    } else if (state === 'complete') {
      borderStyle = 'border-emerald-500/25 bg-[#121C2E]/80 text-emerald-400';
      glowStyle = {
        boxShadow: `0 0 8px rgba(16, 185, 129, 0.12)`
      };
    } else if (state === 'warning') {
      borderStyle = 'border-amber-500/25 bg-[#121C2E]/80 text-amber-400';
      glowStyle = {
        boxShadow: `0 0 8px rgba(245, 158, 11, 0.12)`
      };
    } else {
      borderStyle = 'border-[#243244] bg-[#0D1728]/70 text-white/35';
    }

    return (
      <foreignObject
        key={nodeId}
        x={position.x - 70}
        y={position.y - 75}
        width="140"
        height="160"
        className="overflow-visible select-none"
      >
        <div className="flex flex-col items-center justify-center w-full h-full">
          <motion.div
            whileHover={{ scale: 1.06 }}
            animate={state === 'processing' ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ duration: 1.4, repeat: state === 'processing' ? Infinity : 0, ease: 'easeInOut' }}
            style={glowStyle}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center p-0.5 bg-[#0D1728] border transition-all duration-500 relative ${borderStyle}`}
          >
            {/* Subtle pulse animation ring for active nodes */}
            {state === 'processing' && (
              <motion.div
                className="absolute -inset-1 rounded-2xl border"
                style={{ borderColor: glowColor }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* Glow layer behind active/completed nodes */}
            {state !== 'inactive' && (
              <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            )}
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center shadow-inner transition-all duration-500 ${
                state !== 'inactive'
                  ? `bg-gradient-to-br ${colorClass} text-white`
                  : 'bg-[#121C2E]'
              }`}
            >
              <Icon className={`w-7 h-7 transition-colors duration-500 ${state !== 'inactive' ? 'text-white' : 'text-white/35'}`} />
            </div>
            <div className="absolute -top-1.5 -right-1.5 bg-slate-950 rounded-full p-0.5 border border-white/10 shadow-md flex items-center justify-center">
              {getStatusIcon(state, defaultIcon)}
            </div>
          </motion.div>
          <span className={`text-[11px] font-semibold uppercase mt-3 tracking-[0.18em] text-center transition-colors duration-500 ${
            state === 'processing' ? 'text-white' : state !== 'inactive' ? 'text-white/80' : 'text-white/35'
          }`}>
            {label}
          </span>
          <span className="text-[9px] text-white/45 font-medium mt-0.5 text-center">{subtext}</span>
        </div>
      </foreignObject>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="w-full h-full bg-[#08111F] flex flex-col lg:flex-row overflow-hidden font-sans relative"
    >
      
      {/* Neon Blurred Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] max-w-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] max-w-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[40vw] h-[40vw] max-w-[500px] bg-pink-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Orchestration Space (Left 2/3) */}
      <div className="flex-1 min-h-0 flex flex-col p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#1D2A3B] relative justify-between">
        
        {/* Header Metadata */}
        <div className="z-10 flex justify-between items-start mb-4 shrink-0">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#60A5FA]">Review Pipeline</span>
            </div>
            <h2 className="text-3xl font-semibold text-white tracking-tight">Account Review Workflow</h2>
            <p className="text-white/60 text-xs font-medium mt-1">
              Active review sequence for <span className="text-white/85 font-semibold">{customer?.name}</span>
            </p>
          </div>
          
          {/* Execution details */}
          <div className="flex space-x-6 text-right">
            <div>
              <p className="text-[9px] font-semibold text-white/45 uppercase tracking-[0.16em]">Review State</p>
              <p className="text-xs font-semibold text-[#60A5FA] uppercase tracking-[0.16em]">{sequenceState}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-white/45 uppercase tracking-[0.16em]">Account Owner</p>
              <p className="text-xs font-semibold text-white/85">{customer?.csm || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Area */}
        <div className="flex-1 relative w-full flex items-center justify-center min-h-0 py-2">
          <svg
            viewBox="0 0 1100 220"
            className="w-full h-auto max-w-full max-h-full z-10 overflow-visible"
            style={{ filter: 'drop-shadow(0px 0px 30px rgba(9, 9, 11, 0.4))' }}
          >
            <defs>
              {/* Radial gradient mask for grid background */}
              <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              {/* Neon Line Gradient */}
              <linearGradient id="neon-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Grid Pattern inside SVG */}
            <pattern id="canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#canvas-grid)" />

            {/* SVG Connections (Lines & Flowing Particles) */}
            <SVGConnection 
              path={PATHS.plannerToContext} 
              active={sequenceState === 'PLANNER'} 
              completed={nodeStates.context !== 'inactive'} 
              color="#60a5fa" 
            />
            <SVGConnection 
              path={PATHS.contextToRisk} 
              active={sequenceState === 'CONTEXT'} 
              completed={nodeStates.risk !== 'inactive'} 
              color="#a78bfa" 
            />
            <SVGConnection 
              path={PATHS.riskToRecommendation} 
              active={sequenceState === 'RISK'} 
              completed={nodeStates.recommendation !== 'inactive'} 
              color="#f472b6" 
            />
            <SVGConnection 
              path={PATHS.recommendationToConfidence} 
              active={sequenceState === 'CONFIDENCE_VALIDATING'} 
              completed={nodeStates.confidence !== 'inactive'} 
              color="#fb923c" 
            />
            <SVGConnection 
              path={PATHS.confidenceToMemory} 
              active={sequenceState === 'CONFIDENCE_READY'} 
              completed={nodeStates.memory !== 'inactive'} 
              color="#34d399" 
            />

            {/* Render Nodes dynamically using helper */}
            {renderNode('planner', 'Account Context', 'CRM review', BrainCircuit, <Lock className="w-3.5 h-3.5 text-slate-700" />)}
            {renderNode('context', 'Signal Review', 'Telemetry sync', Database, <Lock className="w-3.5 h-3.5 text-slate-700" />)}
            {renderNode('risk', 'Risk Review', 'Renewal signals', AlertTriangle, <Lock className="w-3.5 h-3.5 text-slate-700" />)}
            {renderNode('recommendation', 'Recommendation Draft', 'CSM guidance', Zap, <Lock className="w-3.5 h-3.5 text-slate-700" />)}
            {renderNode('confidence', 'Validation', 'Independent review', ShieldCheck, <Lock className="w-3.5 h-3.5 text-slate-700" />)}
            {renderNode('memory', 'History Sync', 'Context archive', Cpu, <Lock className="w-3.5 h-3.5 text-slate-700" />)}
          </svg>
        </div>

        {/* Live Terminal Console Overlay (Bottom Center/Left) */}
        <div className="z-10 bg-[#0D1728]/90 border border-[#243244] rounded-2xl p-3 w-full max-w-[650px] shadow-[0_10px_28px_rgba(2,6,23,0.18)] relative shrink-0 h-28 flex flex-col min-h-0 mx-auto">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-2 mb-2">
            <Terminal className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-semibold text-white/60 uppercase tracking-[0.18em]">Review Log</span>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-[10px] text-white/60 space-y-1 scrollbar-hide min-h-0">
            {consoleLogs.length === 0 ? (
              <p className="text-white/35 italic">Initializing systems, standing by...</p>
            ) : (
              consoleLogs.map((log, index) => (
                <div key={index} className="flex space-x-2">
                  <span className="text-[#60A5FA] shrink-0">❯</span>
                  <span className="break-all">{log}</span>
                </div>
              ))
            )}
            <div ref={consoleBottomRef} />
          </div>
        </div>
      </div>

      {/* Intelligence details panel (Right 1/3) */}
      <div className="w-full lg:w-[420px] h-[320px] lg:h-full shrink-0 bg-[#08111F]/95 flex flex-col justify-between p-6 lg:p-8 relative overflow-hidden border-t lg:border-t-0 border-[#1D2A3B]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/0 pointer-events-none" />

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pr-1 min-h-0">
          <AnimatePresence mode="wait">
            {/* Phase A: Loading/Scanning prior to Recommendation completion */}
            {['PLANNER', 'CONTEXT', 'RISK', 'RECOMMENDATION_PROCESSING'].includes(sequenceState) && (
              <motion.div
                key="loading-monitor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-2"
              >
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-slate-900/60 border border-white/10 p-5 rounded-3xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-pink-500 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span>Pipeline Telemetry</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'p', label: 'Initializing Orchestrator Core', done: sequenceState !== 'PLANNER' },
                      { id: 'c', label: 'Querying Pipeline Telemetry', done: !['PLANNER', 'CONTEXT'].includes(sequenceState) },
                      { id: 'r', label: 'Assessing Retention Stability Risk', done: !['PLANNER', 'CONTEXT', 'RISK'].includes(sequenceState) },
                      { id: 're', label: 'Synthesizing Strategic Solutions', done: false }
                    ].map((step, idx) => (
                      <div key={step.id} className="flex items-center space-x-3 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          step.done ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-800 bg-slate-950 text-slate-700'
                        }`}>
                          {step.done ? '✓' : idx === (['PLANNER', 'CONTEXT', 'RISK', 'RECOMMENDATION_PROCESSING'].indexOf(sequenceState)) ? '●' : '○'}
                        </div>
                        <span className={`font-semibold ${step.done ? 'text-slate-300' : 'text-slate-600'}`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-center py-6">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-pink-500 animate-spin mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest animate-pulse">Running pipeline nodes</p>
                </motion.div>
              </motion.div>
            )}

            {/* Phase B: Recommendation ready, reveal Decision Center summary */}
            {sequenceState === 'RECOMMENDATION_READY' && (
              <motion.div
                key="rec-ready-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-2"
              >
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap className="w-24 h-24 text-amber-400" />
                  </div>
                  
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Decision Center</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Contract Status</p>
                      <p className="text-sm font-black text-white">{customer?.renewal_date || 'Analyzing...'}</p>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Calculated Churn Risk</p>
                      <p className={`text-xl font-black uppercase ${
                        riskAnalysis?.churn_risk?.level === 'High' ? 'text-rose-400' :
                        riskAnalysis?.churn_risk?.level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {riskAnalysis?.churn_risk?.level || 'Analyzing...'}
                      </p>
                    </div>

                    <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mb-1">Action Strategy</p>
                      <p className="text-xs text-slate-200 font-bold leading-snug">
                        {recommendations?.[0]?.title || 'Generating recommendations...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/15 rounded-3xl p-4 flex items-center space-x-4">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Independent Review Pending</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Evaluating potential strategy concerns</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase C: Confidence Review Validating (Scanning) */}
            {sequenceState === 'CONFIDENCE_VALIDATING' && (
              <motion.div
                key="confidence-validating-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-2"
              >
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center py-10">
                  {/* Glowing Radar animation */}
                  <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border border-pink-500/10 scale-100" />
                    <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-125" />
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-500/30 border-t-pink-500 animate-spin" />
                    <ShieldCheck className="w-9 h-9 text-indigo-400 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest text-center mb-1">Evaluating Confidence</h3>
                  <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest text-center">Adversarial Checks running...</p>
                  
                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-6 max-w-[180px]">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: '105%' }}
                      transition={{ duration: 2.0 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase D: Confidence Review Ready (Verdict reveal) */}
            {sequenceState === 'CONFIDENCE_READY' && (
              <motion.div
                key="confidence-ready-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-2"
              >
                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="text-indigo-400 w-4 h-4" /> 
                        <span>Confidence Review</span>
                      </h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Independent risk checks completed</p>
                    </div>
                    
                    {/* Animated Score Circle */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                        <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <motion.path
                          className="text-indigo-400"
                          strokeWidth="3"
                          strokeDasharray={`${devilReview?.reviews?.[0]?.confidence || 85}, 100`}
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          initial={{ strokeDasharray: "0, 100" }}
                          animate={{ strokeDasharray: `${devilReview?.reviews?.[0]?.confidence || 85}, 100` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-white">{devilReview?.reviews?.[0]?.confidence || 85}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                    <div>
                      <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block mb-0.5">Critical Challenge</span>
                      <span className="text-xs text-slate-300 font-medium leading-relaxed">
                        {devilReview?.reviews?.[0]?.counter_arguments?.[0] || "Validating pipeline risk mitigation."}
                      </span>
                    </div>
                    
                    <div className="h-px bg-white/5" />
                    
                    <div>
                      <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block mb-0.5">Mitigation Plan</span>
                      <span className="text-xs text-slate-300 font-medium leading-relaxed">
                        {devilReview?.reviews?.[0]?.recommendation || "Pending final adjustments."}
                      </span>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-slate-500">Verdict</span>
                      <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded border bg-emerald-500/20 border-emerald-500/30 inline-block">
                        {devilReview?.reviews?.[0]?.final_verdict || "Approved for CSM dispatch"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase E: Memory sync in progress */}
            {sequenceState === 'MEMORY_READY' && (
              <motion.div
                key="memory-ready-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-2"
              >
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-violet-400 animate-pulse" />
                    <span>Memory Compilation</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Writing synthesis vectors to backend graph databases. This will optimize subsequent recommendation loops.
                  </p>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Database Sync State</span>
                    <span className="text-xs text-violet-400 font-bold flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Synchronizing...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase F: Complete details */}
            {sequenceState === 'COMPLETE' && (
              <motion.div
                key="complete-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 pt-2"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl text-center py-6 relative overflow-hidden"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                  </motion.div>
                  <h3 className="text-base font-black text-white tracking-tighter">Analysis Complete</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
                    Account data has been summarized, reviewed, and finalized through the review workflow.
                  </p>
                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold px-2">
                      <span className="text-slate-500">CSM Dispatched</span>
                      <span className="text-emerald-400 font-black">TRUE</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold px-2">
                      <span className="text-slate-500">Memory Database Indexed</span>
                      <span className="text-emerald-400 font-black">TRUE</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer System Version */}
        <div className="z-10 pt-4 border-t border-[#1D2A3B] flex items-center justify-between text-[9px] font-semibold uppercase text-white/45 tracking-[0.16em] shrink-0 mt-2">
          <span>Enterprise Decision Engine V3.0</span>
          <span>XLVENTURES INTEL SYSTEM</span>
        </div>
      </div>
    </motion.div>
  );
}

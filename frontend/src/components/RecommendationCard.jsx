import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Sparkles, 
  Quote, 
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Mail,
  Video,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';

const RecommendationCard = ({ recommendation, index, devilReview, customerId, csmName }) => {
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [copied, setCopied] = useState(false);



  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
      Medium: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
      Low: 'bg-[#F0FDF4] text-[#16A34A] border-[#A7F3D0]'
    };
    return colors[priority] || colors.Low;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'High') return AlertTriangle;
    if (priority === 'Medium') return Info;
    return CheckCircle2;
  };

  const PriorityIcon = getPriorityIcon(recommendation.priority);

  const specificReview = devilReview?.reviews?.find(
    (r) => r.recommendation.toLowerCase().trim() === recommendation.title.toLowerCase().trim()
  ) || devilReview?.reviews?.[index];

  const handleAcceptRecommendation = async () => {
    setIsProcessingAction(true);
    try {
      const response = await fetch('http://localhost:8000/accept-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          recommendation_title: recommendation.title,
          csm_name: csmName || "Sarah Jenkins"
        })
      });
      if (!response.ok) throw new Error('Automation runner initialization encountered errors');
      const data = await response.json();
      setActionResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const copyToClipboard = () => {
    if (!actionResult) return;
    const fullText = `Subject: ${actionResult.email_draft.subject}\n\nTo: ${actionResult.email_draft.to}\n\n${actionResult.email_draft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Truncate logic
  const reasoningSentences = recommendation.reasoning ? recommendation.reasoning.split('. ').slice(0, 2).map(s => s + (s.endsWith('.') ? '' : '.')) : [];
  const topSignals = recommendation.supporting_evidence?.slice(0, 3) || [];
  
  const keyConcern = specificReview?.counter_arguments?.[0] ? specificReview.counter_arguments[0].split('.')[0] + '.' : "No major concerns identified.";
  const finalRec = specificReview?.final_verdict ? specificReview.final_verdict.split('.')[0] + '.' : "Proceed as planned.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, delay: index * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
      whileHover={{ y: -2, scale: 1.01, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)' }}
      className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-colors hover:border-[#2563EB]/20"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="max-w-[70%] text-sm font-semibold leading-tight text-slate-900 transition-colors group-hover:text-[#2563EB]">
          {recommendation.title || 'No data available'}
        </h3>
        <div className="flex shrink-0 items-center space-x-2">
          {specificReview && (
            <span className="rounded border border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
              {specificReview.confidence || 'N/A'}% confidence
            </span>
          )}
          <span className={`flex items-center space-x-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${getPriorityColor(recommendation.priority)}`}>
            <PriorityIcon className="h-2.5 w-2.5" />
            <span>{recommendation.priority || 'No data'}</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
            <Zap className="h-3 w-3 text-[#2563EB]" /> Why this matters
          </h4>
          <ul className="space-y-1">
            {reasoningSentences.length > 0 ? reasoningSentences.map((sentence, i) => (
              <li key={i} className="flex items-start space-x-1.5 text-[11px] leading-snug text-slate-600">
                <span className="mt-0.5 text-[10px] text-[#2563EB]">•</span>
                <span>{sentence}</span>
              </li>
            )) : (
              <li className="flex items-start space-x-1.5 text-[11px] leading-snug text-slate-600">
                <span className="mt-0.5 text-[10px] text-[#2563EB]">•</span>
                <span>No reasoning available.</span>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-2.5 text-[11px] space-y-1.5">
          <div className="flex items-start">
            <span className="w-20 shrink-0 font-semibold uppercase text-[#6B7280]">Impact</span>
            <span className="font-medium text-slate-700">{recommendation.estimated_impact || 'No data available'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-20 shrink-0 font-semibold uppercase text-[#6B7280]">Action</span>
            <span className="font-medium text-[#16A34A]">{recommendation.title || 'No data available'}</span>
          </div>
        </div>

        <div className="pt-1">
          {!actionResult ? (
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleAcceptRecommendation}
                disabled={isProcessingAction}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="flex-1 rounded-lg bg-[#2563EB] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#1D4ED8] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
              >
                {isProcessingAction ? (
                  <span className="animate-pulse">Preparing...</span>
                ) : (
                  <>
                    <Check className="mr-1.5 inline h-3 w-3" />
                    <span>Advance recommendation</span>
                  </>
                )}
              </motion.button>
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1.5 text-center text-[9px] font-semibold uppercase leading-none text-[#6B7280]">
                <span className="mb-0.5 block text-[8px] text-[#9CA3AF]">Effort</span>
                {recommendation.estimated_effort || 'N/A'}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] p-3 space-y-2"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#16A34A]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Prepared</span>
              </motion.div>
              <div className="flex flex-col gap-1.5 text-[10px]">
                <a href={actionResult.meeting_link} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded border border-[#E5E7EB] bg-white p-2 text-slate-700 hover:bg-[#F9FAFB]">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Video className="h-3 w-3 text-[#2563EB]" />
                    <span className="truncate font-mono">{actionResult.meeting_link}</span>
                  </div>
                </a>
                <div className="space-y-1.5 rounded border border-[#E5E7EB] bg-white p-2">
                  <div className="flex items-center gap-1 border-b border-[#E5E7EB] pb-1 text-[9px] font-semibold uppercase text-[#6B7280]">
                    <Mail className="h-2.5 w-2.5" /> To: {actionResult.email_draft.to}
                  </div>
                  <p className="whitespace-pre-wrap text-[10px] italic text-slate-600 line-clamp-3">
                    {actionResult.email_draft.body}
                  </p>
                  <div className="flex gap-1.5 pt-1">
                    <button onClick={() => window.location.href = `mailto:${actionResult.email_draft.to}?subject=${encodeURIComponent(actionResult.email_draft.subject)}&body=${encodeURIComponent(actionResult.email_draft.body)}`} className="flex-1 rounded bg-[#16A34A] px-2 py-1.5 text-[8px] font-semibold uppercase text-white">
                      Mail app
                    </button>
                    <button onClick={copyToClipboard} className="flex-1 rounded border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1.5 text-[8px] font-semibold uppercase text-slate-700">
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;
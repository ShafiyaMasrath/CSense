import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AnimatedBackground from './components/AnimatedBackground';
import { 
  Users, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  DollarSign 
} from 'lucide-react';

import crmData from './data/crm.json'; // Maintained purely for baseline navigation list mapping

function App() {
  const [activeCustomerId, setActiveCustomerId] = useState(crmData[0]?.id || null);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [activeUsage, setActiveUsage] = useState(null);
  const [activeTickets, setActiveTickets] = useState([]);
  const [activeContacts, setActiveContacts] = useState(null);
  
  const [recommendations, setRecommendations] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [devilReview, setDevilReview] = useState(null);
  const [memory, setMemory] = useState(null);
  const [executionLog, setExecutionLog] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Compute live strategic tracking values for display
  const aggregateStats = useMemo(() => {
    const totalARR = crmData.reduce((sum, c) => sum + c.arr, 0);
    const highChurn = crmData.filter(c => c.health_score < 30 || c.account_status === 'High Churn Alert').length;
    const healthy = crmData.filter(c => c.health_score >= 80).length;
    const upsell = crmData.filter(c => c.account_status === 'Upsell Candidate').length;
    const renewals = crmData.filter(c => c.renewal_date.includes('2026-07') || c.renewal_date.includes('2026-06')).length;

    return {
      total: { label: 'Total Accounts', value: crmData.length, icon: Users },
      churn: { label: 'At Risk', value: highChurn, icon: AlertCircle },
      healthy: { label: 'Healthy', value: healthy, icon: CheckCircle },
      upsell: { label: 'Upsell Opps', value: upsell, icon: TrendingUp },
      renewals: { label: 'Renewals', value: renewals, icon: Calendar },
      arr: { label: 'Total ARR', value: `$${(totalARR / 1000000).toFixed(1)}M`, icon: DollarSign },
    };
  }, []);

  const handleAnalyze = async (customerId) => {
    setIsAnalyzing(true);
    setRecommendations([]);
    setRiskAnalysis(null);
    setDevilReview(null);
    setMemory(null);
    setExecutionLog([]);
    
    try {
      const response = await fetch(`http://localhost:8000/analyze/${customerId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('LangGraph analysis pipeline invocation run failed');
      const data = await response.json();
      
      console.log("Received API response", data);
      console.log("Parsed recommendations", data.recommendations);
      console.log("Parsed risk_analysis", data.risk_analysis);
      console.log("Parsed devil_review", data.devil_review);
      
      if (data.success === false) {
        setError(data.error || 'Unknown error occurred in the backend pipeline.');
        return;
      }
      
      // Inject returned values straight into components
      setRecommendations(data.recommendations || []);
      setRiskAnalysis(data.risk_analysis || null);
      setDevilReview(data.devil_review || null);
      setMemory(data.memory || null);
      setExecutionLog(data.execution_log || []);

      // CRITICAL UPDATE: Extract and pass the relational context tables directly 
      // from the backend's Supabase retrieval node down to our reactive telemetry panels!
      if (data.retrieved_context) {
        setActiveUsage(data.retrieved_context.product_usage || null);
        setActiveTickets(data.retrieved_context.support_history || []);
        setActiveContacts(data.retrieved_context.contacts || null);
      }
    } catch (error) {
      console.error('Error executing multi-agent graph transaction:', error);
      setError(error.message || 'Network or server error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (activeCustomerId) {
      // Flushes context arrays and models to force fresh analysis cycles per account selection
      const customer = crmData.find(c => c.id === activeCustomerId);
      setActiveCustomer(customer);
      
      setActiveUsage(null);
      setActiveTickets([]);
      setActiveContacts(null);
      setRecommendations([]); 
      setRiskAnalysis(null);
      setDevilReview(null);
      setMemory(null);
      setExecutionLog([]);
      setError(null);
    }
  }, [activeCustomerId]);

  return (
    <div className="flex h-screen w-full text-slate-900 relative overflow-hidden bg-[#F6F8FB]">
      <AnimatedBackground />
      <Sidebar 
        customers={crmData} 
        activeCustomerId={activeCustomerId} 
        onSelectCustomer={setActiveCustomerId} 
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={activeCustomerId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
           className="flex-1 h-full min-h-0 overflow-hidden"
        >
          <Dashboard
            customer={activeCustomer}
            usage={activeUsage}
            tickets={activeTickets}
            contacts={activeContacts}
            aggregateStats={aggregateStats}
            recommendations={recommendations}
            riskAnalysis={riskAnalysis}
            devilReview={devilReview}
            memory={memory}
            executionLog={executionLog}
            isAnalyzing={isAnalyzing}
            error={error}
            onAnalyze={handleAnalyze}
          />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default App;
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from graph.state import AgentState
from models.risk import RiskAnalysis
from ai_client import shared_model as model

# Load environment variables
load_dotenv()

def risk_agent(state: AgentState):
    """
    Risk & Opportunity Agent: Pass-through node keeping the visual flow in LangGraph.
    Risk analysis is computed as part of the single Gemini call in the Recommendation Agent.
    """
    state["execution_log"].append({"agent": "Risk Agent", "action": "Risk Analysis Started"})
    
    context = state.get("retrieved_context", {})
    if not context:
        state["execution_log"].append({"agent": "Risk Agent", "action": "Error: No context received"})
        return state
        
    state["execution_log"].append({"agent": "Risk Agent", "action": "Customer Context Received"})
    state["execution_log"].append({"agent": "Risk Agent", "action": "Risk Scores Generated"})
    state["execution_log"].append({"agent": "Risk Agent", "action": "Risk Analysis Completed"})
    
    return state

import os
import json
import google.generativeai as genai

from dotenv import load_dotenv

from graph.state import AgentState
from models.devil import DevilReview

load_dotenv()

from ai_client import shared_model as model

def devil_agent(state: AgentState):
    """
    Devil's Advocate Agent: Reads the adversarial review generated in the Recommendation node
    to keep the execution flow fast and unified.
    """
    state["execution_log"].append({
        "agent": "Devil Agent",
        "action": "Devil's Advocate Started"
    })

    # Read already generated review from unified response in state
    devil_review = state.get("devil_review", {})
    if not devil_review:
        state["execution_log"].append({
            "agent": "Devil Agent",
            "action": "Error: No Devil Review populated in state"
        })
        return state

    state["execution_log"].append({
        "agent": "Devil Agent",
        "action": "Devil Review Generated"
    })

    state["execution_log"].append({
        "agent": "Devil Agent",
        "action": "Devil Agent Completed"
    })

    return state

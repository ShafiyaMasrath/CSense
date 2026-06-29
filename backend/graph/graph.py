from langgraph.graph import StateGraph, END
from graph.state import AgentState
from agents.planner_agent import planner_agent
from agents.context_agent import context_agent
from agents.risk_agent import risk_agent
from agents.recommendation_agent import recommendation_agent
from agents.devil_agent import devil_agent
from agents.memory_agent import memory_agent

def create_graph():
    """
    Creates the LangGraph StateGraph connecting all agents in the CSense intelligence pipeline.
    """
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("planner", planner_agent)
    workflow.add_node("context", context_agent)
    workflow.add_node("risk_analysis", risk_agent)
    workflow.add_node("recommendations", recommendation_agent)
    workflow.add_node("devil_advocate", devil_agent)
    workflow.add_node("memory", memory_agent)

    # Build Graph edges
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "context")
    workflow.add_edge("context", "risk_analysis")
    workflow.add_edge("risk_analysis", "recommendations")
    workflow.add_edge("recommendations", "devil_advocate")
    workflow.add_edge("devil_advocate", "memory")
    workflow.add_edge("memory", END)

    return workflow.compile()

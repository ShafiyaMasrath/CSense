from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    customer_id: str

    customer_data: Dict[str, Any]

    retrieved_context: Dict[str, Any]

    risk_analysis: Dict[str, Any]

    recommendations: List[Dict[str, Any]]

    devil_review: Dict[str, Any]

    memory: Dict[str, Any]

    execution_plan: List[str]

    execution_log: List[Dict[str, str]]
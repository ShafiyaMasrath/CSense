from graph.state import AgentState
from utils.data_loader import load_json_data

def context_agent(state: AgentState):
    """
    Context Retrieval Agent: Fetches and organizes historical data related to the selected customer.
    """
    customer_id = state.get("customer_id")
    state["execution_log"].append({"agent": "Context Agent", "action": "Context Retrieval Started"})

    # 1. Load All Data
    crm_data = load_json_data("crm.json")
    state["execution_log"].append({"agent": "Context Agent", "action": "CRM Loaded"})
    
    meetings_data = load_json_data("meetings.json")
    state["execution_log"].append({"agent": "Context Agent", "action": "Meetings Loaded"})
    
    support_data = load_json_data("support_tickets.json")
    state["execution_log"].append({"agent": "Context Agent", "action": "Support Tickets Loaded"})
    
    usage_data = load_json_data("product_usage.json")
    state["execution_log"].append({"agent": "Context Agent", "action": "Product Usage Loaded"})
    
    contacts_data = load_json_data("contacts.json")
    state["execution_log"].append({"agent": "Context Agent", "action": "Contacts Loaded"})
    
    playbooks_data = load_json_data("playbooks.json")

    # 2. Filter Customer Specific Records
    customer_profile = next((c for c in crm_data if c["id"] == customer_id), {})
    meeting_history = next((m["history"] for m in meetings_data if m["customer_id"] == customer_id), [])
    support_history = [t for t in support_data if t["customer_id"] == customer_id]
    product_usage = next((u for u in usage_data if u["customer_id"] == customer_id), {})
    contacts = next((c for c in contacts_data if c["customer_id"] == customer_id), {})

    # 3. Match Relevant Playbooks
    recommended_playbooks = []
    health_score = customer_profile.get("health_score", 100)
    stability_score = contacts.get("champion_stability_score", 100)
    
    if health_score < 30:
        recommended_playbooks.append(next((p for p in playbooks_data if p["playbook_id"] == "PB-CHURN-001"), {}))
    if stability_score < 40:
        recommended_playbooks.append(next((p for p in playbooks_data if p["playbook_id"] == "PB-CHURN-002"), {}))
    if health_score > 75:
        recommended_playbooks.append(next((p for p in playbooks_data if p["playbook_id"] == "PB-UPSELL-001"), {}))
    
    # Always include renewal if applicable
    recommended_playbooks.append(next((p for p in playbooks_data if p["playbook_id"] == "PB-RENEWAL-001"), {}))
    
    state["execution_log"].append({"agent": "Context Agent", "action": "Playbooks Matched"})

    # 4. Construct Context Object
    state["retrieved_context"] = {
        "customer_profile": customer_profile,
        "meeting_history": meeting_history,
        "support_history": support_history,
        "product_usage": product_usage,
        "contacts": contacts,
        "recommended_playbooks": [p for p in recommended_playbooks if p] # Filter out empty matches
    }

    state["execution_log"].append({"agent": "Context Agent", "action": "Context Retrieval Completed"})
    return state

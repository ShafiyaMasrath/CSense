from graph.state import AgentState

def memory_agent(state: AgentState):

    summary = {
        "customer_id":
        state["customer_id"],

        "summary":
        f"""
Risk completed.
Generated {len(state.get('recommendations',[]))}
 recommendations.
        """
    }

    state["memory"] = summary

    state["execution_log"].append({
        "agent":"Memory Agent",
        "action":"Memory Stored"
    })

    return state
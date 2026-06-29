from graph.graph import create_graph
import json

graph = create_graph()
initial_state = {
    "customer_id": "C001",
    "customer_data": {},
    "retrieved_context": {},
    "risk_analysis": {},
    "recommendations": [],
    "devil_review": {},
    "memory": {},
    "execution_plan": [],
    "execution_log": []
}

for event in graph.stream(initial_state):
    print("EVENT:", event.keys())

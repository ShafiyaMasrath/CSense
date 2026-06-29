import json
import os

def load_json_data(filename: str):
    """
    Helper to load data from the backend/data directory.
    """
    # Try multiple paths to find the data folder (handles different run contexts)
    possible_paths = [
        os.path.join(os.getcwd(), "data", filename),
        os.path.join(os.getcwd(), "backend", "data", filename),
        os.path.join(os.getcwd(), "..", "backend", "data", filename),
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
    
    return []

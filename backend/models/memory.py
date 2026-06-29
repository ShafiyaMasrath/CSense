from pydantic import BaseModel

class MemorySummary(BaseModel):
    customer_id:str
    summary:str
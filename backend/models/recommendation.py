from typing import List, Literal
from pydantic import BaseModel, Field

class Recommendation(BaseModel):
    title: str
    priority: Literal["High", "Medium", "Low"]
    estimated_impact: str
    estimated_effort: str
    reasoning: str
    supporting_evidence: List[str]

class RecommendationList(BaseModel):
    recommendations: List[Recommendation] = Field(..., max_length=3)

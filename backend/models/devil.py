from pydantic import BaseModel
from typing import List

class Review(BaseModel):
    recommendation: str
    confidence: int
    counter_arguments: List[str]
    risk_level: str
    final_verdict: str

class DevilReview(BaseModel):
    reviews: List[Review]
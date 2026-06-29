from pydantic import BaseModel, Field

class RiskScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    level: str
    reasoning: str

class OpportunityScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    reasoning: str

class ProductAdoption(BaseModel):
    score: int = Field(..., ge=0, le=100)
    reasoning: str

class ChampionStability(BaseModel):
    score: int = Field(..., ge=0, le=100)
    reasoning: str

class RiskAnalysis(BaseModel):
    churn_risk: RiskScore
    expansion_opportunity: OpportunityScore
    product_adoption: ProductAdoption
    champion_stability: ChampionStability
    overall_summary: str

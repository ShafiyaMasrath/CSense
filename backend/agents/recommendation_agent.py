import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from graph.state import AgentState
from models.recommendation import RecommendationList
from models.risk import RiskAnalysis
from models.devil import DevilReview

# Load environment variables
load_dotenv()

# Configure Gemini
from ai_client import shared_model as model

def recommendation_agent(state: AgentState):
    """
    Next Best Action Agent: Generates unified, strategic, data-driven recommendations,
    risk scores, and adversarial reviews for the CSM in a single Gemini call.
    """
    state["execution_log"].append({"agent": "Recommendation Agent", "action": "Recommendation Agent Started"})
    
    context = state.get("retrieved_context", {})
    state["execution_log"].append({"agent": "Recommendation Agent", "action": "Risk Analysis Received"})
    
    if context:
        state["execution_log"].append({"agent": "Recommendation Agent", "action": "Customer Context Received"})

    # Prepare Unified Prompt
    prompt = f"""
    You are an expert Customer Success Analyst, Strategy Manager, and Devil's Advocate.
    Analyze the following customer context and provide a unified, structured assessment.
    
    CUSTOMER CONTEXT:
    {json.dumps(context, indent=2)}
    
    You must complete three distinct tasks:
    
    TASK 1: RISK & OPPORTUNITY ASSESSMENT
    - Assess Churn Risk (Score 0-100, Level "High/Medium/Low", Reasoning - max 15 words)
    - Assess Expansion Opportunity (Score 0-100, Reasoning - max 15 words)
    - Assess Product Adoption (Score 0-100, Reasoning - max 15 words)
    - Assess Champion Stability (Score 0-100, Reasoning - max 15 words)
    - Provide an Overall Summary (Max 30 words).
    
    TASK 2: NEXT BEST ACTIONS (NBAs)
    - Generate exactly THREE specific, actionable recommendations to maximize customer retention and expansion.
    - Rank them by business impact (Churn avoidance or ARR growth).
    - For each recommendation, include:
      - Title (e.g., "Schedule QBR", "Product Training")
      - Priority (High | Medium | Low)
      - Estimated Impact (Maximum 1 short sentence)
      - Estimated Effort (Maximum 1 short sentence)
      - Detailed Reasoning (Maximum 40 words, ideally 3 short bullet points)
      - Supporting Evidence (Maximum 3 most critical signals/data points from the context)
      
    TASK 3: ADVERSARIAL CONFIDENCE REVIEW (DEVIL'S ADVOCATE)
    - Challenge the generated recommendations.
    - For each of the three generated recommendations, provide:
      - recommendation: the exact Title of the recommendation you are challenging
      - confidence: a confidence score (0-100) indicating how confident you are in this recommendation despite the challenge
      - counter_arguments: list of critical challenges or reasons why this recommendation might fail (each max 15 words)
      - risk_level: Risk level of implementing this recommendation (High | Medium | Low)
      - final_verdict: A final verdict statement or suggestion to adjust the strategy (max 15 words)
      
    RESPONSE FORMAT:
    You must respond with a valid JSON object matching this unified schema:
    {{
      "risk_analysis": {{
        "churn_risk": {{ "score": 0, "level": "High/Medium/Low", "reasoning": "" }},
        "expansion_opportunity": {{ "score": 0, "reasoning": "" }},
        "product_adoption": {{ "score": 0, "reasoning": "" }},
        "champion_stability": {{ "score": 0, "reasoning": "" }},
        "overall_summary": ""
      }},
      "recommendations": [
        {{
          "title": "",
          "priority": "High",
          "estimated_impact": "",
          "estimated_effort": "",
          "reasoning": "",
          "supporting_evidence": [""]
        }}
      ],
      "devil_review": {{
        "reviews": [
          {{
            "recommendation": "",
            "confidence": 80,
            "counter_arguments": [""],
            "risk_level": "Medium",
            "final_verdict": ""
          }}
        ]
      }}
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        )
        
        state["execution_log"].append({"agent": "Recommendation Agent", "action": "Gemini Generated Recommendations"})
        
        # Parse and Validate
        raw_response = json.loads(response.text)
        
        # Validate risk analysis
        risk_data = raw_response.get("risk_analysis", {})
        validated_risk = RiskAnalysis(**risk_data)
        state["risk_analysis"] = validated_risk.model_dump()
        
        # Validate recommendations
        rec_list_data = {"recommendations": raw_response.get("recommendations", [])}
        validated_rec = RecommendationList(**rec_list_data)
        state["recommendations"] = [r.dict() for r in validated_rec.recommendations]
        
        # Validate devil review
        devil_data = raw_response.get("devil_review", {})
        validated_devil = DevilReview(**devil_data)
        state["devil_review"] = validated_devil.model_dump()
        
        state["execution_log"].append({"agent": "Recommendation Agent", "action": "Recommendations Ranked"})
        
    except Exception as e:
        error_msg = f"Recommendation generation failed: {str(e)}"
        state["execution_log"].append({"agent": "Recommendation Agent", "action": error_msg})
        print(error_msg)
        raise e

    state["execution_log"].append({"agent": "Recommendation Agent", "action": "Recommendation Agent Completed"})
    return state

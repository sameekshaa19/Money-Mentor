"""
POST /api/health-score — Accepts a user profile and returns 6-dimension health scores.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from gemini.client import ask_gemini
from gemini.prompts import HEALTH_SCORE_PROMPT
from utils.scoring import compute_health_scores

router = APIRouter()


class UserProfile(BaseModel):
    age: int
    monthly_income: float
    monthly_expenses: float
    total_debt: float
    emergency_fund: float
    total_investments: float
    insurance_cover: float
    savings_rate: float  # percentage


@router.post("/health-score")
async def health_score(profile: UserProfile):
    """Evaluate the user's financial health across 6 dimensions."""
    profile_dict = profile.model_dump()

    # Rule-based local scores
    local_scores = compute_health_scores(profile_dict)

    # Gemini AI insights
    prompt = HEALTH_SCORE_PROMPT.format(user_profile=json.dumps(profile_dict))
    try:
        raw = await ask_gemini(prompt)
        ai_result = json.loads(raw)
    except json.JSONDecodeError:
        ai_result = {"raw_response": raw}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {
        "status": "success",
        "data": {
            "local_scores": local_scores,
            "ai_insights": ai_result,
        },
    }

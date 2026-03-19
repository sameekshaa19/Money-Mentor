"""
POST /api/goals — Returns SIP per goal, progress status, and conflict detection.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from gemini.client import ask_gemini
from gemini.prompts import GOALS_PROMPT
from utils.sip_math import calculate_sip

router = APIRouter()


class Goal(BaseModel):
    name: str
    target_amount: float
    current_savings: float
    timeline_years: int
    expected_return: float  # annual %


class GoalsInput(BaseModel):
    goals: List[Goal]
    monthly_surplus: float


@router.post("/goals")
async def plan_goals(data: GoalsInput):
    """Compute SIP for each goal, detect conflicts if total > surplus."""
    results = []
    total_sip = 0.0

    for goal in data.goals:
        sip = calculate_sip(
            target=goal.target_amount,
            current=goal.current_savings,
            annual_rate=goal.expected_return,
            years=goal.timeline_years,
        )
        progress = round((goal.current_savings / goal.target_amount) * 100, 1) if goal.target_amount else 0
        results.append({
            "name": goal.name,
            "monthly_sip": round(sip, 2),
            "progress": progress,
            "status": "on_track" if progress >= 25 else "behind",
        })
        total_sip += sip

    has_conflict = total_sip > data.monthly_surplus

    # Gemini insights
    prompt = GOALS_PROMPT.format(goals_data=json.dumps(data.model_dump()))
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
            "goals": results,
            "total_sip_needed": round(total_sip, 2),
            "monthly_surplus": data.monthly_surplus,
            "has_conflict": has_conflict,
            "ai_insights": ai_result,
        },
    }

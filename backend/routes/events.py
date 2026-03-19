"""
POST /api/life-event — Returns full before/after advice for a major life event.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from gemini.client import ask_gemini
from gemini.prompts import LIFE_EVENT_PROMPT

router = APIRouter()


class LifeEventInput(BaseModel):
    event_type: str  # e.g. "marriage", "baby", "job_change", "home_purchase"
    monthly_income: float
    monthly_expenses: float
    total_investments: float
    insurance_cover: float
    emergency_fund: float
    additional_details: Optional[str] = None


@router.post("/life-event")
async def life_event_advice(data: LifeEventInput):
    """Analyse the financial impact of a life event and provide before/after advice."""
    user_details = data.model_dump()

    prompt = LIFE_EVENT_PROMPT.format(
        event_type=data.event_type,
        user_details=json.dumps(user_details),
    )

    try:
        raw = await ask_gemini(prompt)
        analysis = json.loads(raw)
    except json.JSONDecodeError:
        analysis = {"raw_response": raw}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {"status": "success", "data": analysis}

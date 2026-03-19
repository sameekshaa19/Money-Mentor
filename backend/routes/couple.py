"""
POST /api/couple — Accepts two partner profiles, returns joint financial plan.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from gemini.client import ask_gemini
from gemini.prompts import COUPLE_FINANCE_PROMPT
from utils.tax import compute_tax_savings

router = APIRouter()


class PartnerProfile(BaseModel):
    name: str
    age: int
    annual_income: float
    monthly_expenses: float
    tax_regime: str  # "old" or "new"
    hra_received: Optional[float] = 0
    rent_paid: Optional[float] = 0
    nps_contribution: Optional[float] = 0
    insurance_cover: Optional[float] = 0
    total_investments: Optional[float] = 0


class CoupleInput(BaseModel):
    partner_a: PartnerProfile
    partner_b: PartnerProfile


@router.post("/couple")
async def couple_plan(data: CoupleInput):
    """Generate a joint financial optimisation plan for a couple."""
    partner_a = data.partner_a.model_dump()
    partner_b = data.partner_b.model_dump()

    # Local tax savings estimate
    tax_a = compute_tax_savings(partner_a)
    tax_b = compute_tax_savings(partner_b)

    # Gemini joint plan
    prompt = COUPLE_FINANCE_PROMPT.format(
        partner_a=json.dumps(partner_a),
        partner_b=json.dumps(partner_b),
    )
    try:
        raw = await ask_gemini(prompt)
        ai_plan = json.loads(raw)
    except json.JSONDecodeError:
        ai_plan = {"raw_response": raw}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {
        "status": "success",
        "data": {
            "tax_savings": {"partner_a": tax_a, "partner_b": tax_b},
            "joint_plan": ai_plan,
        },
    }

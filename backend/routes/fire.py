"""
POST /api/fire — Returns FIRE target corpus, required SIP, and year-by-year projection.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from gemini.client import ask_gemini
from gemini.prompts import FIRE_PROMPT
from utils.sip_math import calculate_sip

router = APIRouter()


class FIREInput(BaseModel):
    current_age: int
    retirement_age: int
    monthly_expenses: float
    current_corpus: float
    expected_return: float  # annual % e.g. 12.0


@router.post("/fire")
async def fire_plan(data: FIREInput):
    """Calculate FIRE target, required SIP, year-by-year projection."""
    user_inputs = data.model_dump()

    # Local SIP calculation
    years = data.retirement_age - data.current_age
    inflation_rate = 6.0  # Indian average
    future_annual_expenses = data.monthly_expenses * 12 * ((1 + inflation_rate / 100) ** years)
    target_corpus = future_annual_expenses / 0.04  # 4 % rule

    monthly_sip = calculate_sip(
        target=target_corpus,
        current=data.current_corpus,
        annual_rate=data.expected_return,
        years=years,
    )

    # Year-by-year projection
    yearly_projection = []
    corpus = data.current_corpus
    monthly_rate = data.expected_return / 100 / 12
    for year in range(1, years + 1):
        for _ in range(12):
            corpus = corpus * (1 + monthly_rate) + monthly_sip
        yearly_projection.append({"year": year, "corpus": round(corpus, 2)})

    # Gemini narrative
    prompt = FIRE_PROMPT.format(
        user_inputs=json.dumps(user_inputs),
        expected_return=data.expected_return,
    )
    try:
        raw = await ask_gemini(prompt)
        ai_result = json.loads(raw)
    except json.JSONDecodeError:
        ai_result = {"narrative": raw}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {
        "status": "success",
        "data": {
            "target_corpus": round(target_corpus, 2),
            "monthly_sip": round(monthly_sip, 2),
            "yearly_projection": yearly_projection,
            "ai_insights": ai_result,
        },
    }

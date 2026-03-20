"""
POST /api/fire — Returns FIRE target corpus, required SIP, and year-by-year projection.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from utils.sip_math import calculate_sip

router = APIRouter()


class FIREInput(BaseModel):
    current_age: int
    retirement_age: int
    monthly_expenses: float
    current_corpus: float
    expected_return: float


@router.post("/fire")
async def fire_plan(data: FIREInput):
    years = data.retirement_age - data.current_age
    inflation_rate = 6.0
    future_annual_expenses = data.monthly_expenses * 12 * ((1 + inflation_rate / 100) ** years)
    target_corpus = future_annual_expenses / 0.04

    monthly_sip = calculate_sip(
        target=target_corpus,
        current=data.current_corpus,
        annual_rate=data.expected_return,
        years=years,
    )

    yearly_projection = []
    corpus = data.current_corpus
    monthly_rate = data.expected_return / 100 / 12
    for year in range(1, years + 1):
        for _ in range(12):
            corpus = corpus * (1 + monthly_rate) + monthly_sip
        yearly_projection.append({"year": year, "corpus": round(corpus, 2)})

    return {
        "status": "success",
        "data": {
            "target_corpus": round(target_corpus, 2),
            "monthly_sip": round(monthly_sip, 2),
            "yearly_projection": yearly_projection,
            "ai_insights": {"message": "AI insights coming soon"},
        },
    }

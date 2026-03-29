from fastapi import APIRouter
from pydantic import BaseModel
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
    savings_rate: float

@router.post("/health-score")
async def health_score(profile: UserProfile):
    profile_dict = profile.model_dump()
    local_scores = compute_health_scores(profile_dict)
    return {
        "status": "success",
        "data": local_scores
    }
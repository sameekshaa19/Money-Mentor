import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from gemini.client import ask_gemini
from gemini.prompts import LIFE_EVENT_PROMPT

router = APIRouter()

class LifeEventInput(BaseModel):
    event_type: str
    monthly_income: float
    monthly_expenses: float
    total_investments: float
    insurance_cover: float
    emergency_fund: float
    additional_details: Optional[str] = None

@router.post('/life-event')
async def life_event_advice(data: LifeEventInput):
    user_details = data.model_dump()
    prompt = LIFE_EVENT_PROMPT.format(
        event_type=data.event_type,
        user_details=json.dumps(user_details),
    )
    try:
        raw = await ask_gemini(prompt)
        analysis = json.loads(raw)
    except Exception:
        analysis = {
            'event': data.event_type,
            'before': {
                'Monthly SIP': round(data.monthly_expenses * 0.2),
                'Emergency Fund': round(data.emergency_fund),
                'Insurance': round(data.insurance_cover),
                'Net Worth': round(data.total_investments)
            },
            'after': {
                'Monthly SIP': round(data.monthly_expenses * 0.3),
                'Emergency Fund': round(data.emergency_fund * 1.5),
                'Insurance': round(data.insurance_cover * 2),
                'Net Worth': round(data.total_investments * 1.2)
            },
            'recommendations': [
                'Review and increase your emergency fund',
                'Update your insurance coverage',
                'Adjust your monthly SIP amounts',
                'Consult a financial advisor for personalised advice'
            ]
        }
    return {'status': 'success', 'data': analysis}

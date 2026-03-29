"""
POST /api/life-event — Returns full before/after advice for a major life event.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

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
    
    # Generate local advice instead of calling Gemini
    analysis = generate_life_event_advice(data.event_type, user_details)

    return {"status": "success", "data": analysis}


def generate_life_event_advice(event_type, user_details):
    """Generate local advice for life events"""
    
    # Base before state
    before = {
        'Monthly SIP': user_details['monthly_income'] - user_details['monthly_expenses'],
        'Emergency Fund': user_details['emergency_fund'],
        'Insurance': user_details['insurance_cover'],
        'Net Worth': user_details['total_investments'],
        'Monthly Expenses': user_details['monthly_expenses']
    }
    
    # Calculate after state based on event type
    after = before.copy()
    recommendations = []
    
    if event_type == 'bonus':
        # Assume 20% of annual income as bonus
        bonus_amount = user_details['monthly_income'] * 12 * 0.2
        after['Monthly SIP'] += bonus_amount / 12  # Spread bonus over 12 months
        recommendations.extend([
            'Deploy 60% of bonus into equity funds for long-term growth',
            'Use 20% to build emergency fund if below 6 months',
            'Consider debt funds for 20% for stability',
            'Avoid lifestyle inflation - maintain current expenses'
        ])
        
    elif event_type == 'inheritance':
        # Assume ₹50 lakh inheritance
        inheritance_amount = 5000000
        after['Net Worth'] += inheritance_amount
        after['Emergency Fund'] = max(after['Emergency Fund'], user_details['monthly_expenses'] * 6)
        recommendations.extend([
            'Create a separate emergency fund with 6 months expenses',
            'Invest 70% in diversified equity funds',
            'Consider 20% in debt funds for stability',
            'Use 10% for immediate financial goals',
            'Consult tax advisor for inheritance tax implications'
        ])
        
    elif event_type == 'marriage':
        after['Monthly Expenses'] *= 1.5  # 50% increase in expenses
        after['Insurance'] *= 2  # Double insurance for spouse
        after['Monthly SIP'] = user_details['monthly_income'] - after['Monthly Expenses']
        recommendations.extend([
            'Create joint financial goals with spouse',
            'Increase health insurance coverage for family',
            'Review and update nominations',
            'Consider creating a family emergency fund',
            'Plan for combined retirement goals'
        ])
        
    elif event_type == 'baby':
        after['Monthly Expenses'] *= 1.3  # 30% increase
        after['Insurance'] += 2000000  # Add ₹20L for child insurance
        after['Emergency Fund'] *= 1.5  # Increase emergency fund
        after['Monthly SIP'] = user_details['monthly_income'] - after['Monthly Expenses']
        recommendations.extend([
            'Start child education fund with 15-year horizon',
            'Increase life insurance by ₹20-25 lakhs',
            'Create separate emergency fund for family',
            'Review health insurance for family coverage',
            'Consider opening a minor PPF account'
        ])
        
    elif event_type == 'job_loss':
        after['Monthly SIP'] = 0  # No SIP possible
        after['Monthly Expenses'] *= 0.7  # Cut expenses by 30%
        recommendations.extend([
            'Immediately cut non-essential expenses by 30%',
            'Use emergency fund for essential expenses only',
            'Focus on active job searching',
            'Consider freelance or part-time work',
            'Review insurance premiums and reduce if possible'
        ])
        
    elif event_type == 'home':
        # Assume ₹50 lakh home loan
        emi_amount = 40000  # Approximate EMI for ₹50L at 8% for 20 years
        after['Monthly Expenses'] += emi_amount
        after['Monthly SIP'] = user_details['monthly_income'] - after['Monthly Expenses']
        after['Net Worth'] += 5000000  # Asset value
        recommendations.extend([
            'Ensure EMI is within 30% of monthly income',
            'Maintain emergency fund of 6 months including EMI',
            'Get adequate home insurance',
            'Consider tax benefits on home loan',
            'Plan for maintenance and property tax costs'
        ])
    
    return {
        'before': before,
        'after': after,
        'recommendations': recommendations
    }

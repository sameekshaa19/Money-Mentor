"""
POST /api/goals — Returns SIP per goal, progress status, and conflict detection.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
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

    # Generate local insights instead of calling Gemini
    ai_result = generate_goals_insights(data.goals, total_sip, data.monthly_surplus, has_conflict)

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


def generate_goals_insights(goals, total_sip, surplus, has_conflict):
    """Generate local insights for goals planning"""
    insights = {
        "summary": "",
        "recommendations": [],
        "priority_actions": []
    }
    
    # Summary
    if has_conflict:
        insights["summary"] = f"Your goals require ₹{total_sip:,.0f}/month but you only have ₹{surplus:,.0f} available. You need to prioritize or increase surplus."
    else:
        insights["summary"] = f"Your goals require ₹{total_sip:,.0f}/month which is within your surplus of ₹{surplus:,.0f}. You're on track!"
    
    # Recommendations
    if has_conflict:
        insights["recommendations"].append("Consider extending timelines for lower priority goals")
        insights["recommendations"].append("Look for ways to increase your monthly surplus")
        insights["recommendations"].append("Prioritize goals with shorter timelines")
    else:
        insights["recommendations"].append("Set up automatic SIPs for goal amounts")
        insights["recommendations"].append("Review progress quarterly and adjust if needed")
        insights["recommendations"].append("Consider investing surplus for faster goal achievement")
    
    # Priority actions
    if goals:
        highest_sip_goal = max(goals, key=lambda g: calculate_sip(g.target_amount, g.current_savings, g.expected_return, g.timeline_years))
        insights["priority_actions"].append(f"Focus on {highest_sip_goal.name} - requires highest SIP")
    
    short_term_goals = [g for g in goals if g.timeline_years <= 3]
    if short_term_goals:
        insights["priority_actions"].append(f"Secure short-term goals: {', '.join([g.name for g in short_term_goals])}")
    
    return insights

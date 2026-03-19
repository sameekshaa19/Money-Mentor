"""
Rule-based health score logic for 6 financial dimensions.
Returns local scores before Gemini AI adds insights on top.
"""

from typing import Dict


def _clamp(value: float, lo: float = 0, hi: float = 100) -> float:
    return max(lo, min(hi, value))


def compute_health_scores(profile: Dict) -> Dict:
    """
    Compute scores (0-100) for each financial health dimension.

    Expects keys: age, monthly_income, monthly_expenses, total_debt,
                  emergency_fund, total_investments, insurance_cover, savings_rate
    """
    income = profile["monthly_income"]
    expenses = profile["monthly_expenses"]

    # 1. Emergency Fund Adequacy (target: 6 months of expenses)
    ef_months = profile["emergency_fund"] / expenses if expenses else 0
    ef_score = _clamp(ef_months / 6 * 100)

    # 2. Debt-to-Income Ratio (lower is better; 0 % → 100, ≥ 50 % → 0)
    dti = (profile["total_debt"] / (income * 12)) * 100 if income else 100
    dti_score = _clamp(100 - dti * 2)

    # 3. Insurance Coverage (target: 10× annual income)
    target_cover = income * 12 * 10
    ins_ratio = profile["insurance_cover"] / target_cover if target_cover else 0
    ins_score = _clamp(ins_ratio * 100)

    # 4. Investment Diversification (simple heuristic: investments > 20× monthly expenses)
    inv_ratio = profile["total_investments"] / (expenses * 20) if expenses else 0
    inv_score = _clamp(inv_ratio * 100)

    # 5. Savings Rate (target: ≥ 30 %)
    sr = profile["savings_rate"]
    sr_score = _clamp(sr / 30 * 100)

    # 6. Retirement Readiness (heuristic: corpus ≥ 25× annual expenses by age 60)
    years_to_retire = max(60 - profile["age"], 1)
    needed = expenses * 12 * 25
    progress = profile["total_investments"] / needed if needed else 0
    age_factor = (60 - profile["age"]) / 35  # normalise for working years left
    rr_score = _clamp(progress / max(1 - age_factor, 0.1) * 100)

    def _status(score):
        if score >= 70:
            return "good"
        elif score >= 40:
            return "warning"
        return "critical"

    dimensions = [
        {"name": "Emergency Fund", "score": round(ef_score), "status": _status(ef_score)},
        {"name": "Debt-to-Income", "score": round(dti_score), "status": _status(dti_score)},
        {"name": "Insurance Coverage", "score": round(ins_score), "status": _status(ins_score)},
        {"name": "Investment Diversification", "score": round(inv_score), "status": _status(inv_score)},
        {"name": "Savings Rate", "score": round(sr_score), "status": _status(sr_score)},
        {"name": "Retirement Readiness", "score": round(rr_score), "status": _status(rr_score)},
    ]

    overall = round(sum(d["score"] for d in dimensions) / 6)

    return {"dimensions": dimensions, "overall_score": overall}

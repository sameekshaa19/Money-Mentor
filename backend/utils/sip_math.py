"""
SIP (Systematic Investment Plan) math helper.
Wraps numpy_financial.pmt() — used by FIRE + Goals calculators.
"""

import numpy_financial as npf


def calculate_sip(
    target: float,
    current: float,
    annual_rate: float,
    years: int,
) -> float:
    """
    Calculate required monthly SIP to reach `target` from `current` corpus.

    Parameters:
        target:      Future value needed (₹)
        current:     Current invested amount (₹)
        annual_rate: Expected annual return in % (e.g. 12.0)
        years:       Investment horizon in years

    Returns:
        Monthly SIP amount (₹, positive number).
    """
    if years <= 0:
        return 0.0

    monthly_rate = annual_rate / 100 / 12
    n_months = years * 12

    if monthly_rate == 0:
        remaining = target - current
        return max(remaining / n_months, 0)

    # Future value of current corpus
    fv_current = current * ((1 + monthly_rate) ** n_months)
    remaining_target = target - fv_current

    if remaining_target <= 0:
        return 0.0

    # numpy_financial.pmt returns negative (outflow), so we negate
    sip = -npf.pmt(monthly_rate, n_months, 0, remaining_target)
    return max(sip, 0)

"""
XIRR (Extended Internal Rate of Return) calculator using scipy.optimize.
Used by the X-Ray module to compute annualized portfolio returns.
"""

from datetime import datetime
from typing import List, Dict
from scipy.optimize import brentq


def _xnpv(rate: float, cashflows: List[Dict]) -> float:
    """Calculate the net present value of a series of cashflows at irregular intervals."""
    t0 = cashflows[0]["date"]
    return sum(
        cf["amount"] / (1 + rate) ** ((cf["date"] - t0).days / 365.25)
        for cf in cashflows
    )


def calculate_xirr(transactions: List[Dict], guess: float = 0.1) -> float:
    """
    Compute XIRR for a list of transactions.

    Each transaction is a dict with:
        - date: ISO date string e.g. "2022-01-15"
        - amount: float (negative = investment, positive = redemption/current value)

    Returns annualized return as a decimal (e.g. 0.12 for 12 %).
    """
    if not transactions or len(transactions) < 2:
        return 0.0

    cashflows = []
    for t in transactions:
        dt = t["date"] if isinstance(t["date"], datetime) else datetime.fromisoformat(t["date"])
        cashflows.append({"date": dt, "amount": t["amount"]})

    cashflows.sort(key=lambda x: x["date"])

    try:
        return round(brentq(_xnpv, -0.99, 10.0, args=(cashflows,)), 6)
    except ValueError:
        # Brent's method failed — fall back to simple guess
        return guess

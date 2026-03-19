"""
Indian income-tax bracket lookup, HRA exemption, and NPS optimisation rules.
Used by the Couple finance module.
"""

from typing import Dict


# FY 2024-25 tax slabs
OLD_REGIME_SLABS = [
    (250_000, 0.00),
    (500_000, 0.05),
    (1_000_000, 0.20),
    (float("inf"), 0.30),
]

NEW_REGIME_SLABS = [
    (300_000, 0.00),
    (700_000, 0.05),
    (1_000_000, 0.10),
    (1_200_000, 0.15),
    (1_500_000, 0.20),
    (float("inf"), 0.30),
]


def _calc_tax(income: float, slabs) -> float:
    """Calculate tax for given income and slab structure."""
    tax = 0.0
    prev_limit = 0
    for limit, rate in slabs:
        taxable = min(income, limit) - prev_limit
        if taxable <= 0:
            break
        tax += taxable * rate
        prev_limit = limit
    return tax


def hra_exemption(basic: float, hra_received: float, rent_paid: float, metro: bool = True) -> float:
    """Calculate HRA exemption under old regime."""
    pct = 0.50 if metro else 0.40
    return min(
        hra_received,
        pct * basic,
        max(rent_paid - 0.10 * basic, 0),
    )


def nps_80ccd1b_benefit(contribution: float, tax_slab_rate: float) -> float:
    """Extra ₹50 000 deduction under 80CCD(1B) — tax saved."""
    eligible = min(contribution, 50_000)
    return eligible * tax_slab_rate


def compute_tax_savings(partner: Dict) -> Dict:
    """
    Compare old vs new regime for a partner and return savings summary.

    partner keys: annual_income, tax_regime, hra_received, rent_paid, nps_contribution
    """
    income = partner["annual_income"]

    # Old regime with deductions
    hra = hra_exemption(
        basic=income * 0.5,  # assume basic = 50 % of CTC
        hra_received=partner.get("hra_received", 0),
        rent_paid=partner.get("rent_paid", 0),
    )
    nps_benefit_amount = min(partner.get("nps_contribution", 0), 50_000)
    standard_deduction = 50_000
    sec80c = 150_000  # assuming max utilised

    old_taxable = max(income - hra - nps_benefit_amount - standard_deduction - sec80c, 0)
    old_tax = _calc_tax(old_taxable, OLD_REGIME_SLABS)

    # New regime (minimal deductions — only standard deduction)
    new_taxable = max(income - 75_000, 0)  # enhanced SD in new regime
    new_tax = _calc_tax(new_taxable, NEW_REGIME_SLABS)

    better_regime = "old" if old_tax <= new_tax else "new"
    savings = abs(old_tax - new_tax)

    return {
        "old_regime_tax": round(old_tax, 2),
        "new_regime_tax": round(new_tax, 2),
        "recommended_regime": better_regime,
        "annual_savings": round(savings, 2),
        "hra_exemption": round(hra, 2),
        "nps_80ccd1b_saving": round(nps_benefit_amount * 0.30, 2),  # at highest slab
    }

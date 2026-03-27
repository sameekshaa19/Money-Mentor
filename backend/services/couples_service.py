"""
Couple's Money Planner Service
Provides tax optimization, NPS strategy, SIP allocation, insurance recommendations, and net worth calculation.
"""

from typing import Dict, List, Optional

# Metro cities for HRA calculation
METRO_CITIES = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Pune"]


def calculate_hra_optimization(partner_a: Dict, partner_b: Dict) -> Dict:
    """
    Calculate optimal HRA exemption strategy for a couple.
    
    Args:
        partner_a: Dict with basic_salary, hra_received, rent_paid, city
        partner_b: Dict with basic_salary, hra_received, rent_paid, city
        
    Returns:
        Dict with exemption amounts, tax saved, and recommendation
        
    Formula for HRA exemption:
        exemption = min(
            hra_received,
            0.5 * basic_salary if metro else 0.4 * basic_salary,
            rent_paid - 0.1 * basic_salary
        )
    """
    def calculate_exemption(partner: Dict) -> float:
        basic = partner.get('basic_salary', 0)
        hra = partner.get('hra_received', 0)
        rent = partner.get('rent_paid', 0)
        city = partner.get('city', '')
        
        # Determine metro status
        is_metro = any(m.lower() in city.lower() for m in METRO_CITIES)
        
        # Calculate the three limits
        limit1 = hra
        limit2 = 0.5 * basic if is_metro else 0.4 * basic
        limit3 = max(0, rent - 0.1 * basic)
        
        return min(limit1, limit2, limit3)
    
    def calculate_tax_saved(exemption: float, tax_bracket: float) -> float:
        # Tax saved = exemption * tax_rate (as decimal)
        return exemption * (tax_bracket / 100)
    
    # Calculate for Partner A
    a_exemption = calculate_exemption(partner_a)
    a_tax_bracket = partner_a.get('tax_bracket', 0)
    a_tax_saved = calculate_tax_saved(a_exemption, a_tax_bracket)
    
    # Calculate for Partner B
    b_exemption = calculate_exemption(partner_b)
    b_tax_bracket = partner_b.get('tax_bracket', 0)
    b_tax_saved = calculate_tax_saved(b_exemption, b_tax_bracket)
    
    # Determine recommendation
    if a_tax_saved > b_tax_saved:
        recommended = "A"
        additional_saving = a_tax_saved - b_tax_saved
    else:
        recommended = "B"
        additional_saving = b_tax_saved - a_tax_saved
    
    explanation = (
        f"Partner {recommended} should claim HRA as it saves ₹{max(a_tax_saved, b_tax_saved):,.0f} "
        f"in taxes vs ₹{min(a_tax_saved, b_tax_saved):,.0f} if Partner {'B' if recommended == 'A' else 'A'} claims. "
        f"Additional benefit: ₹{additional_saving:,.0f}/year."
    )
    
    return {
        'partner_a_exemption': round(a_exemption, 2),
        'partner_a_tax_saved': round(a_tax_saved, 2),
        'partner_b_exemption': round(b_exemption, 2),
        'partner_b_tax_saved': round(b_tax_saved, 2),
        'recommended_claimant': recommended,
        'additional_saving_if_optimized': round(additional_saving, 2),
        'explanation': explanation
    }


def calculate_nps_optimization(partner_a: Dict, partner_b: Dict) -> Dict:
    """
    Calculate optimal NPS contribution strategy for tax savings under 80CCD(1B).
    
    Args:
        partner_a: Dict with tax_bracket
        partner_b: Dict with tax_bracket
        
    Returns:
        Dict with recommended contributions and tax savings
        
    Note:
        Maximum additional 80CCD(1B) benefit = ₹50,000 per person
        Household max = ₹1,00,000
    """
    NPS_LIMIT = 50000
    
    a_bracket = partner_a.get('tax_bracket', 0)
    b_bracket = partner_b.get('tax_bracket', 0)
    
    # Recommended contribution (max limit)
    a_recommended = NPS_LIMIT
    b_recommended = NPS_LIMIT
    
    # Calculate tax saved
    a_tax_saving = a_recommended * (a_bracket / 100)
    b_tax_saving = b_recommended * (b_bracket / 100)
    total_saving = a_tax_saving + b_tax_saving
    
    return {
        'partner_a_recommended_contribution': a_recommended,
        'partner_b_recommended_contribution': b_recommended,
        'partner_a_tax_saving': round(a_tax_saving, 2),
        'partner_b_tax_saving': round(b_tax_saving, 2),
        'total_household_nps_saving': round(total_saving, 2)
    }


def calculate_sip_split(partner_a: Dict, partner_b: Dict, monthly_sip_target: float) -> Dict:
    """
    Calculate optimal SIP split between partners for tax efficiency.
    
    Args:
        partner_a: Dict with tax_bracket
        partner_b: Dict with tax_bracket
        monthly_sip_target: Total monthly SIP amount
        
    Returns:
        Dict with split amounts, ratio, and reasoning
        
    Logic:
        - LTCG on equity > ₹1.25L taxed at 12.5%
        - Route more investment through lower tax bracket partner
        - If brackets equal: split 50/50
        - If one is 30% and other is 10%: route 70% through lower bracket partner
    """
    a_bracket = partner_a.get('tax_bracket', 0)
    b_bracket = partner_b.get('tax_bracket', 0)
    
    # Determine split ratio based on tax brackets
    if a_bracket == b_bracket:
        # Equal brackets - split 50:50
        a_ratio = 0.5
        b_ratio = 0.5
        reasoning = "Equal tax brackets - split SIPs equally for balanced exposure."
    elif a_bracket < b_bracket:
        # Partner A has lower bracket
        # Base split: 60:40, increase based on bracket difference
        bracket_diff = b_bracket - a_bracket
        if bracket_diff >= 20:
            a_ratio = 0.7
            b_ratio = 0.3
        elif bracket_diff >= 10:
            a_ratio = 0.65
            b_ratio = 0.35
        else:
            a_ratio = 0.6
            b_ratio = 0.4
        reasoning = (
            f"Route {int(a_ratio * 100)}% through Partner A (lower tax bracket) "
            f"to save on LTCG tax when gains exceed ₹1.25L/year."
        )
    else:
        # Partner B has lower bracket
        bracket_diff = a_bracket - b_bracket
        if bracket_diff >= 20:
            a_ratio = 0.3
            b_ratio = 0.7
        elif bracket_diff >= 10:
            a_ratio = 0.35
            b_ratio = 0.65
        else:
            a_ratio = 0.4
            b_ratio = 0.6
        reasoning = (
            f"Route {int(b_ratio * 100)}% through Partner B (lower tax bracket) "
            f"to save on LTCG tax when gains exceed ₹1.25L/year."
        )
    
    # Calculate split amounts
    a_sip = monthly_sip_target * a_ratio
    b_sip = monthly_sip_target * b_ratio
    
    # Calculate potential annual tax saving
    # Assuming 12% returns on equity funds
    # LTCG at 12.5% above 1.25L exemption
    annual_sip = monthly_sip_target * 12
    assumed_returns = annual_sip * 0.12  # 12% returns
    
    # Tax saving from optimal split
    higher_bracket = max(a_bracket, b_bracket)
    lower_bracket = min(a_bracket, b_bracket)
    
    # If brackets are equal, no additional saving from split
    if higher_bracket == lower_bracket:
        tax_saving = 0
    else:
        # Rough estimate: difference in tax brackets applied to expected gains
        bracket_diff = higher_bracket - lower_bracket
        # Only gains above 1.25L are taxed, so estimate taxable portion
        estimated_taxable_gains = max(0, assumed_returns - 125000)
        tax_saving = estimated_taxable_gains * (bracket_diff / 100) * 0.125  # 12.5% LTCG
    
    return {
        'partner_a_sip': round(a_sip, 2),
        'partner_b_sip': round(b_sip, 2),
        'split_ratio': f"{int(a_ratio * 100)}:{int(b_ratio * 100)}",
        'annual_tax_saving_from_split': round(max(0, tax_saving), 2),
        'reasoning': reasoning
    }


def recommend_health_insurance(partner_a: Dict, partner_b: Dict) -> Dict:
    """
    Recommend health insurance type (floater vs individual) and coverage amount.
    
    Args:
        partner_a: Dict with age, has_chronic_condition, city
        partner_b: Dict with age, has_chronic_condition, city
        
    Returns:
        Dict with recommendation, coverage amount, and reasoning
        
    Logic:
        - Age gap > 3 years → individual policies
        - Any chronic condition → individual
        - Metro cities: minimum ₹20L
        - Tier 2: minimum ₹10L
        - Add ₹5L per child
    """
    a_age = partner_a.get('age', 30)
    b_age = partner_b.get('age', 30)
    a_chronic = partner_a.get('has_chronic_condition', False)
    b_chronic = partner_b.get('has_chronic_condition', False)
    a_city = partner_a.get('city', '')
    b_city = partner_b.get('city', '')
    
    # Determine if metro
    is_metro = any(
        m.lower() in a_city.lower() or m.lower() in b_city.lower() 
        for m in METRO_CITIES
    )
    
    # Check age gap
    age_gap = abs(a_age - b_age)
    
    # Determine recommendation
    if age_gap > 3 or a_chronic or b_chronic:
        recommendation = "individual"
        if a_chronic or b_chronic:
            reasoning = (
                "Recommend individual policies due to chronic health condition. "
                "Floater claims by one partner affect the entire family's coverage."
            )
        else:
            reasoning = (
                f"Recommend individual policies due to {age_gap}-year age gap. "
                f"Floater premiums are based on the oldest member, making it expensive."
            )
    else:
        recommendation = "floater"
        reasoning = (
            "Family floater recommended - similar ages with no chronic conditions. "
            "More cost-effective than two individual policies."
        )
    
    # Calculate recommended cover
    base_cover = 2000000 if is_metro else 1000000
    
    # Add buffer for age
    max_age = max(a_age, b_age)
    if max_age > 40:
        base_cover += 500000
    if max_age > 50:
        base_cover += 1000000
    
    recommended_cover = base_cover
    
    # Check current cover gap
    a_current = partner_a.get('current_health_cover', 0)
    b_current = partner_b.get('current_health_cover', 0)
    total_current = a_current + b_current
    
    current_gap = max(0, recommended_cover - total_current)
    
    return {
        'recommendation': recommendation,
        'recommended_cover': recommended_cover,
        'current_gap': current_gap,
        'reasoning': reasoning
    }


def calculate_net_worth(partner_a: Dict, partner_b: Dict) -> Dict:
    """
    Calculate combined net worth for a couple.
    
    Args:
        partner_a: Dict with asset and liability fields
        partner_b: Dict with asset and liability fields
        
    Returns:
        Dict with individual and combined net worth breakdown
    """
    # Asset fields
    asset_fields = [
        'savings', 'mf_value', 'pf_balance', 'nps_balance',
        'property_value', 'gold_value'
    ]
    
    # Liability fields
    liability_fields = [
        'home_loan_outstanding', 'car_loan', 'credit_card_debt', 'other_loans'
    ]
    
    # Calculate Partner A
    a_assets = sum(partner_a.get(field, 0) for field in asset_fields)
    a_liabilities = sum(partner_a.get(field, 0) for field in liability_fields)
    
    # Calculate Partner B
    b_assets = sum(partner_b.get(field, 0) for field in asset_fields)
    b_liabilities = sum(partner_b.get(field, 0) for field in liability_fields)
    
    # Combined
    combined_assets = a_assets + b_assets
    combined_liabilities = a_liabilities + b_liabilities
    net_worth = combined_assets - combined_liabilities
    
    # Asset breakdown by category
    asset_breakdown = {}
    for field in asset_fields:
        total = partner_a.get(field, 0) + partner_b.get(field, 0)
        if total > 0:
            asset_breakdown[field] = total
    
    # Liability breakdown
    liability_breakdown = {}
    for field in liability_fields:
        total = partner_a.get(field, 0) + partner_b.get(field, 0)
        if total > 0:
            liability_breakdown[field] = total
    
    return {
        'partner_a_assets': round(a_assets, 2),
        'partner_a_liabilities': round(a_liabilities, 2),
        'partner_b_assets': round(b_assets, 2),
        'partner_b_liabilities': round(b_liabilities, 2),
        'combined_assets': round(combined_assets, 2),
        'combined_liabilities': round(combined_liabilities, 2),
        'net_worth': round(net_worth, 2),
        'asset_breakdown': asset_breakdown,
        'liability_breakdown': liability_breakdown
    }

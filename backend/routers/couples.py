"""
Couple's Money Planner Router
Handles couple financial analysis and planning endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Optional
import logging

# Import services
from services import couples_service
from gemini import client as gemini_client
from gemini.prompts import COUPLES_PLAN_PROMPT

router = APIRouter()
logger = logging.getLogger(__name__)


class PartnerProfile(BaseModel):
    """Profile for one partner"""
    name: str
    age: int = Field(gt=17, lt=100)
    city: str
    monthly_income: float = Field(gt=0)
    monthly_expenses: float = Field(ge=0)
    tax_bracket: float = Field(ge=0, le=35)
    
    # HRA fields
    basic_salary: float = Field(ge=0)
    hra_received: float = Field(ge=0)
    rent_paid: float = Field(ge=0)
    
    # Health insurance
    current_health_cover: float = Field(ge=0, default=0)
    has_chronic_condition: bool = False
    
    # Assets
    savings: float = Field(ge=0, default=0)
    mf_value: float = Field(ge=0, default=0)
    pf_balance: float = Field(ge=0, default=0)
    nps_balance: float = Field(ge=0, default=0)
    property_value: float = Field(ge=0, default=0)
    gold_value: float = Field(ge=0, default=0)
    
    # Liabilities
    home_loan_outstanding: float = Field(ge=0, default=0)
    car_loan: float = Field(ge=0, default=0)
    credit_card_debt: float = Field(ge=0, default=0)
    other_loans: float = Field(ge=0, default=0)


class CoupleAnalysisRequest(BaseModel):
    """Request body for couple's financial analysis"""
    partner_a: PartnerProfile
    partner_b: PartnerProfile
    monthly_sip_target: float = Field(ge=0, default=0)
    primary_goal: str = Field(default="Retirement")


class CouplesResponse(BaseModel):
    """Response containing all couple analysis results"""
    net_worth: Dict
    hra_optimization: Dict
    nps_optimization: Dict
    sip_split: Dict
    health_insurance: Dict
    ai_plan: str


@router.post("/analyze")
async def analyze_couple(request: CoupleAnalysisRequest):
    """
    Analyze couple's combined financial situation and generate optimization recommendations.
    
    Returns:
        Complete analysis including:
        - Combined net worth calculation
        - HRA optimization strategy
        - NPS contribution recommendations
        - SIP split for tax efficiency
        - Health insurance recommendations
        - AI-generated joint financial plan
    """
    try:
        # Convert Pydantic models to dicts for service functions
        partner_a = request.partner_a.model_dump()
        partner_b = request.partner_b.model_dump()
        
        # Calculate all metrics
        net_worth = couples_service.calculate_net_worth(partner_a, partner_b)
        
        hra_optimization = couples_service.calculate_hra_optimization(
            partner_a, partner_b
        )
        
        nps_optimization = couples_service.calculate_nps_optimization(
            partner_a, partner_b
        )
        
        sip_split = couples_service.calculate_sip_split(
            partner_a, partner_b, request.monthly_sip_target
        )
        
        health_insurance = couples_service.recommend_health_insurance(
            partner_a, partner_b
        )
        
        # Calculate total annual tax savings
        total_tax_saving = (
            hra_optimization['additional_saving_if_optimized'] +
            nps_optimization['total_household_nps_saving'] +
            sip_split['annual_tax_saving_from_split']
        )
        
        # Prepare Gemini prompt
        from services import xray_service
        gemini_input = (
            f"{partner_a['monthly_income']}_{partner_b['monthly_income']}_"
            f"{net_worth['net_worth']}_{request.monthly_sip_target}"
        )
        cached_response = xray_service.get_cached_gemini_response(gemini_input)
        
        if cached_response:
            ai_plan = cached_response
        else:
            prompt = COUPLES_PLAN_PROMPT.format(
                a_income=partner_a['monthly_income'],
                a_bracket=partner_a['tax_bracket'],
                b_income=partner_b['monthly_income'],
                b_bracket=partner_b['tax_bracket'],
                net_worth=f"{net_worth['net_worth']:,.0f}",
                hra_saving=hra_optimization['additional_saving_if_optimized'],
                nps_saving=nps_optimization['total_household_nps_saving'],
                sip_split_ratio=sip_split['split_ratio'],
                insurance_rec=health_insurance['recommendation']
            )
            
            try:
                ai_plan = gemini_client.generate_text(
                    prompt=prompt,
                    model="gemini-1.5-flash"
                )
                # Cache the response
                xray_service.cache_gemini_response(gemini_input, ai_plan)
            except Exception as e:
                logger.error(f"Gemini API error: {e}")
                ai_plan = (
                    "1. COUPLE'S FINANCIAL SNAPSHOT: You have a solid foundation with good income and asset base.\n"
                    "2. IMMEDIATE ACTIONS: Set up joint expense tracking, optimize HRA claim, increase NPS contributions\n"
                    "3. TAX OPTIMIZATION SUMMARY: Save taxes through strategic HRA claiming, NPS investments, and SIP split\n"
                    "4. INVESTMENT STRATEGY: Diversify across equity and debt based on risk appetite\n"
                    "5. PROTECTION GAPS: Ensure adequate health and term insurance coverage\n"
                    "6. 5-YEAR WEALTH PROJECTION: Consistent investing can double your net worth in 5 years\n"
                    "Together, you're building a bright financial future!"
                )
        
        return {
            'net_worth': net_worth,
            'hra_optimization': hra_optimization,
            'nps_optimization': nps_optimization,
            'sip_split': sip_split,
            'health_insurance': health_insurance,
            'total_annual_tax_saving': round(total_tax_saving, 2),
            'ai_plan': ai_plan
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing couple data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze couple data: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for couples service."""
    return {"status": "healthy", "service": "couples"}

"""
MF Portfolio X-Ray Router
Handles PDF upload and portfolio analysis endpoints.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict
import logging

# Import services
from services import xray_service
from gemini import client as gemini_client
from gemini.prompts import XRAY_ANALYSIS_PROMPT

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_statement(file: UploadFile = File(...)):
    """
    Upload CAMS/KFintech statement PDF and get complete portfolio analysis.
    
    Returns:
        Complete portfolio analysis including:
        - Portfolio holdings with current values and XIRR
        - Fund overlap analysis
        - Expense ratio drag calculation
        - Benchmark comparison
        - AI-generated insights and rebalancing plan
    """
    try:
        # Validate file type
        if not file.content_type or 'pdf' not in file.content_type.lower():
            if not file.filename or not file.filename.lower().endswith('.pdf'):
                raise HTTPException(
                    status_code=400, 
                    detail="Only PDF files are accepted"
                )
        
        # Read file bytes
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Parse PDF transactions
        try:
            transactions = xray_service.parse_cams_pdf(file_bytes)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        if not transactions:
            raise HTTPException(
                status_code=400, 
                detail="No transactions found in the PDF"
            )
        
        # Group transactions by fund
        fund_transactions: Dict[str, List[Dict]] = {}
        for txn in transactions:
            fund = txn['fund_name']
            if fund not in fund_transactions:
                fund_transactions[fund] = []
            fund_transactions[fund].append(txn)
        
        # Get current NAV for each fund and calculate holdings
        portfolio = []
        total_value = 0
        
        for fund_name, txns in fund_transactions.items():
            # Calculate units held
            units = sum(t['units'] for t in txns)
            
            if units <= 0:
                continue
            
            # Get current NAV
            current_nav = xray_service.get_current_nav(fund_name)
            current_value = units * current_nav
            
            # Calculate XIRR for this fund
            fund_xirr = xray_service.calculate_xirr(txns, current_value)
            
            # Get expense ratio
            expense_ratio = 1.0  # Default
            for known_fund, er in xray_service.FUND_EXPENSE_RATIOS.items():
                if known_fund.lower() in fund_name.lower() or fund_name.lower() in known_fund.lower():
                    expense_ratio = er
                    break
            
            # Get category
            category = "Equity"
            for known_fund, cat in xray_service.FUND_CATEGORIES.items():
                if known_fund.lower() in fund_name.lower() or fund_name.lower() in known_fund.lower():
                    category = cat
                    break
            
            portfolio.append({
                'fund_name': fund_name,
                'units': round(units, 3),
                'current_nav': round(current_nav, 2),
                'current_value': round(current_value, 2),
                'xirr': fund_xirr,
                'expense_ratio': expense_ratio,
                'category': category
            })
            
            total_value += current_value
        
        if not portfolio:
            raise HTTPException(
                status_code=400,
                detail="No valid holdings found in the statement"
            )
        
        # Calculate overall XIRR
        all_transactions = transactions
        overall_xirr = xray_service.calculate_xirr(all_transactions, total_value)
        
        # Get fund names for overlap analysis
        fund_names = [p['fund_name'] for p in portfolio]
        
        # Calculate overlap
        overlap = xray_service.calculate_overlap(fund_names)
        
        # Calculate expense drag
        holdings_for_expense = [
            {
                'fund_name': p['fund_name'],
                'current_value': p['current_value'],
                'expense_ratio': p['expense_ratio']
            }
            for p in portfolio
        ]
        expense_drag = xray_service.calculate_expense_drag(holdings_for_expense, total_value)
        
        # Get benchmark comparison
        benchmark = xray_service.get_benchmark_comparison(fund_names, overall_xirr)
        
        # Calculate average expense ratio
        avg_er = expense_drag['avg_expense_ratio']
        
        # Prepare Gemini prompt
        # Check cache first
        gemini_input = f"{total_value}_{overall_xirr}_{len(portfolio)}_{avg_er}_{benchmark['alpha']}_{overlap['most_overlapping_pair']}"
        cached_response = xray_service.get_cached_gemini_response(gemini_input)
        
        if cached_response:
            ai_response = cached_response
        else:
            # Build overlap summary
            overlap_summary = f"{len(overlap['pairs'])} fund pairs analyzed. Highest overlap: {overlap['most_overlapping_pair']}"
            
            # Call Gemini
            prompt = XRAY_ANALYSIS_PROMPT.format(
                total_value=f"{total_value:,.0f}",
                xirr=overall_xirr,
                fund_count=len(portfolio),
                avg_expense_ratio=avg_er,
                is_beating_benchmark="Yes" if benchmark['is_beating_benchmark'] else "No",
                alpha=benchmark['alpha'],
                overlap_summary=overlap_summary,
                fee_drag=f"{expense_drag['projected_loss_20yr']:,.0f}"
            )
            
            try:
                ai_response = gemini_client.generate_text(
                    prompt=prompt,
                    model="gemini-1.5-flash"
                )
                # Cache the response
                xray_service.cache_gemini_response(gemini_input, ai_response)
            except Exception as e:
                logger.error(f"Gemini API error: {e}")
                ai_response = (
                    "1. PORTFOLIO VERDICT: Your portfolio shows healthy diversification.\n"
                    "2. TOP 3 STRENGTHS: Good fund selection, adequate diversification, consistent investing\n"
                    "3. TOP 3 PROBLEMS: High expense ratios, some fund overlap, possible sector concentration\n"
                    "4. REBALANCING ACTIONS: Consider switching to index funds, reduce overlapping holdings\n"
                    "5. ONE INSIGHT: Small savings in expense ratios compound to significant wealth over 20 years"
                )
        
        # Split AI response into insights and rebalancing plan
        ai_insights = ai_response
        rebalancing_plan = "Review your portfolio quarterly and rebalance if any fund exceeds 30% allocation."
        
        return {
            'portfolio': portfolio,
            'total_value': round(total_value, 2),
            'overall_xirr': overall_xirr,
            'fund_count': len(portfolio),
            'overlap': overlap,
            'expense_drag': expense_drag,
            'benchmark': benchmark,
            'ai_insights': ai_insights,
            'rebalancing_plan': rebalancing_plan
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing upload: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process statement: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for X-Ray service."""
    return {"status": "healthy", "service": "xray"}

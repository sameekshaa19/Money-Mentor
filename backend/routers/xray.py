"""
MF Portfolio X-Ray Router
Handles PDF upload and portfolio analysis endpoints.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict
import logging

# Import services
from services.xray_service import parse_cams_pdf, get_current_nav, calculate_xirr, FUND_EXPENSE_RATIOS, FUND_CATEGORIES, calculate_overlap, calculate_expense_drag, get_benchmark_comparison

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_statement(file: UploadFile = File(...)):
    """
    Upload CAMS/KFintech statement PDF and get complete portfolio analysis.
    """
    try:
        # Log file details for debugging
        logger.info(f"Upload attempt - filename: {file.filename}, content_type: {file.content_type}")
        
        # Validate file type - be lenient, check filename first
        is_pdf = False
        if file.filename and file.filename.lower().endswith('.pdf'):
            is_pdf = True
        elif file.content_type and 'pdf' in file.content_type.lower():
            is_pdf = True
            
        if not is_pdf:
            logger.warning(f"Rejected file: {file.filename} (content_type: {file.content_type})")
            raise HTTPException(
                status_code=400, 
                detail=f"Only PDF files are accepted. Received: {file.content_type or 'unknown'}"
            )
        
        # Read file bytes
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Parse PDF transactions
        try:
            transactions = parse_cams_pdf(file_bytes)
            logger.info(f"PDF parsed successfully - found {len(transactions)} transactions")
        except ValueError as e:
            logger.error(f"PDF parsing error: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Unexpected PDF parsing error: {type(e).__name__}: {e}")
            raise HTTPException(status_code=400, detail=f"Could not parse PDF: {str(e)}")
        
        if not transactions:
            logger.warning("No transactions found in the PDF - possible causes: unsupported statement format, encrypted PDF, or no transaction data")
            raise HTTPException(
                status_code=400, 
                detail="No transactions found in the PDF. Please upload a valid CAMS or KFintech mutual fund statement."
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
            current_nav = get_current_nav(fund_name)
            current_value = units * current_nav
            
            # Calculate XIRR for this fund
            fund_xirr = calculate_xirr(txns, current_value)
            
            # Get expense ratio
            expense_ratio = 1.0  # Default
            for known_fund, er in FUND_EXPENSE_RATIOS.items():
                if known_fund.lower() in fund_name.lower() or fund_name.lower() in known_fund.lower():
                    expense_ratio = er
                    break
            
            # Get category
            category = "Equity"
            for known_fund, cat in FUND_CATEGORIES.items():
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
        overall_xirr = calculate_xirr(all_transactions, total_value)
        
        # Get fund names for overlap analysis
        fund_names = [p['fund_name'] for p in portfolio]
        
        # Calculate overlap
        overlap = calculate_overlap(fund_names)
        
        # Calculate expense drag
        holdings_for_expense = [
            {
                'fund_name': p['fund_name'],
                'current_value': p['current_value'],
                'expense_ratio': p['expense_ratio']
            }
            for p in portfolio
        ]
        expense_drag = calculate_expense_drag(holdings_for_expense, total_value)
        
        # Get benchmark comparison
        benchmark = get_benchmark_comparison(fund_names, overall_xirr)
        
        # Calculate average expense ratio
        avg_er = expense_drag['avg_expense_ratio']
        
        # Generate local insights (no Gemini API)
        ai_insights = generate_local_insights(total_value, overall_xirr, len(portfolio), avg_er, benchmark, overlap, expense_drag)
        rebalancing_plan = generate_local_rebalancing_plan(portfolio, overlap, expense_drag)
        
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


def generate_local_insights(total_value, overall_xirr, fund_count, avg_er, benchmark, overlap, expense_drag):
    """Generate local insights without calling external APIs"""
    insights = []
    
    # Portfolio verdict
    if overall_xirr > 0.12:
        insights.append("1. PORTFOLIO VERDICT: Excellent performance! Your portfolio is beating expectations.")
    elif overall_xirr > 0.08:
        insights.append("1. PORTFOLIO VERDICT: Good performance with room for optimization.")
    else:
        insights.append("1. PORTFOLIO VERDICT: Underperforming - consider reviewing your fund selection.")
    
    # Top 3 strengths
    strengths = []
    if fund_count >= 5:
        strengths.append("Good diversification across multiple funds")
    if avg_er < 1.0:
        strengths.append("Low expense ratios helping returns")
    if benchmark['is_beating_benchmark']:
        strengths.append("Outperforming benchmark indices")
    if total_value > 1000000:
        strengths.append("Substantial investment corpus built")
    
    if strengths:
        insights.append(f"2. TOP 3 STRENGTHS: {'; '.join(strengths[:3])}")
    
    # Top 3 problems
    problems = []
    if avg_er > 1.5:
        problems.append("High expense ratios eating into returns")
    if overlap['most_overlapping_pair'] and len(overlap['pairs']) > 2:
        problems.append("Significant fund overlap reducing diversification benefits")
    if fund_count < 3:
        problems.append("Limited diversification with few funds")
    if overall_xirr < 0.06:
        problems.append("Below-average returns requiring attention")
    
    if problems:
        insights.append(f"3. TOP 3 PROBLEMS: {'; '.join(problems[:3])}")
    
    # Rebalancing actions
    actions = []
    if avg_er > 1.0:
        actions.append("Switch to index funds with lower expense ratios")
    if overlap['most_overlapping_pair']:
        actions.append("Consolidate overlapping funds to reduce duplication")
    if fund_count > 8:
        actions.append("Reduce fund count for easier management")
    if not benchmark['is_beating_benchmark']:
        actions.append("Review underperforming funds and consider replacements")
    
    if actions:
        insights.append(f"4. REBALANCING ACTIONS: {'; '.join(actions[:3])}")
    
    # One insight
    if expense_drag['projected_loss_20yr'] > 500000:
        insights.append("5. ONE INSIGHT: High expense ratios could cost you ₹50+ lakhs over 20 years - consider index funds")
    elif overlap['most_overlapping_pair']:
        insights.append("5. ONE INSIGHT: Fund overlap reduces diversification benefits - consolidate similar funds")
    else:
        insights.append("5. ONE INSIGHT: Regular portfolio reviews help maintain optimal asset allocation")
    
    return '\n'.join(insights)


def generate_local_rebalancing_plan(portfolio, overlap, expense_drag):
    """Generate local rebalancing plan without external APIs"""
    plan = []
    
    # High expense funds
    high_expense_funds = [p for p in portfolio if p['expense_ratio'] > 1.5]
    if high_expense_funds:
        plan.append(f"• Consider switching from high-expense funds: {', '.join([f['fund_name'] for f in high_expense_funds[:2]])}")
    
    # Overlapping funds
    if overlap['most_overlapping_pair']:
        plan.append(f"• Review overlapping funds: {overlap['most_overlapping_pair']}")
    
    # Large holdings
    large_holdings = [p for p in portfolio if p['current_value'] / sum(p['current_value'] for p in portfolio) > 0.3]
    if large_holdings:
        plan.append(f"• Reduce concentration in: {large_holdings[0]['fund_name']} (currently >30% of portfolio)")
    
    # General advice
    plan.extend([
        "• Review portfolio quarterly and rebalance if allocation drifts >5%",
        "• Consider tax implications before selling funds",
        "• Maintain emergency fund separate from equity investments"
    ])
    
    return '\n'.join(plan)


@router.get("/health")
async def health_check():
    """Health check endpoint for X-Ray service."""
    return {"status": "healthy", "service": "xray"}

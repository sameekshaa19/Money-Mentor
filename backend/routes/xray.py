"""
POST /api/xray — Accepts a CAMS/KFintech PDF and returns a full portfolio X-Ray.
"""

import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from gemini.client import ask_gemini
from gemini.prompts import XRAY_ANALYSIS_PROMPT
from utils.pdf_parser import extract_portfolio_from_pdf
from utils.xirr import calculate_xirr

router = APIRouter()


@router.post("/xray")
async def portfolio_xray(file: UploadFile = File(...)):
    """Upload a CAMS/KFintech PDF statement for full portfolio analysis."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    try:
        pdf_bytes = await file.read()
        portfolio_data = extract_portfolio_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {e}")

    # Calculate XIRR locally for accuracy
    try:
        xirr_results = calculate_xirr(portfolio_data.get("transactions", []))
    except Exception:
        xirr_results = None

    # Ask Gemini for full analysis
    prompt = XRAY_ANALYSIS_PROMPT.format(portfolio_data=json.dumps(portfolio_data))
    try:
        raw = await ask_gemini(prompt)
        analysis = json.loads(raw)
    except json.JSONDecodeError:
        analysis = {"raw_response": raw}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Merge local XIRR into analysis
    if xirr_results is not None:
        analysis["xirr"] = xirr_results

    return {"status": "success", "data": analysis}

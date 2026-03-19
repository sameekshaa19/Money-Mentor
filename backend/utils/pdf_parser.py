"""
CAMS / KFintech PDF text extractor using pdfplumber.
Parses mutual-fund consolidated account statements.
"""

import io
import re
from typing import Dict, List
import pdfplumber


def extract_portfolio_from_pdf(pdf_bytes: bytes) -> Dict:
    """
    Extract portfolio holdings and transaction data from a CAMS/KFintech PDF.

    Returns a dict with:
        - funds: list of fund dicts (name, folio, units, nav, value)
        - transactions: list of transaction dicts (date, amount, type, fund)
    """
    funds: List[Dict] = []
    transactions: List[Dict] = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        full_text = ""
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            full_text += page_text + "\n"

    # -------- Parse fund holdings --------
    fund_pattern = re.compile(
        r"(?P<fund_name>[A-Za-z\s\-]+(?:Fund|Plan|Growth|Dividend))"
        r".*?Folio\s*No[:\s]*(?P<folio>\w+)"
        r".*?(?P<units>[\d,]+\.\d+)\s+(?P<nav>[\d,]+\.\d+)\s+(?P<value>[\d,]+\.\d+)",
        re.IGNORECASE | re.DOTALL,
    )
    for match in fund_pattern.finditer(full_text):
        funds.append({
            "name": match.group("fund_name").strip(),
            "folio": match.group("folio").strip(),
            "units": float(match.group("units").replace(",", "")),
            "nav": float(match.group("nav").replace(",", "")),
            "value": float(match.group("value").replace(",", "")),
        })

    # -------- Parse transactions --------
    txn_pattern = re.compile(
        r"(?P<date>\d{2}-[A-Za-z]{3}-\d{4})\s+"
        r"(?P<type>Purchase|Redemption|Switch In|Switch Out|SIP)\s+"
        r"(?P<amount>[\d,]+\.\d+)",
        re.IGNORECASE,
    )
    for match in txn_pattern.finditer(full_text):
        amount = float(match.group("amount").replace(",", ""))
        txn_type = match.group("type").strip()
        # Investments are negative cashflows, redemptions positive
        if txn_type.lower() in ("purchase", "sip", "switch in"):
            amount = -amount

        transactions.append({
            "date": match.group("date"),
            "amount": amount,
            "type": txn_type,
        })

    return {"funds": funds, "transactions": transactions}

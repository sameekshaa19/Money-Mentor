"""
MF Portfolio X-Ray Service
Provides portfolio analysis, XIRR calculation, fund overlap, expense drag, and benchmark comparison.

FIXES applied over original:
  1. Dead code block in parse_cams_pdf — transaction extraction was inside except clause, never ran
  2. Greedy fund-name regex overwriting current_fund with header/footer lines
  3. No CAMS vs KFintech format detection (different date formats, column orders)
  4. Fallback table extractor firing on every line, creating duplicate junk transactions
  5. `amount` used before assignment in pattern-4 branch
"""

import re
import io
import hashlib
from datetime import datetime
from typing import List, Dict, Optional
import requests
import pdfplumber
import numpy_financial as npf

# Module-level caches
_nav_cache: Dict[str, Dict] = {}
_gemini_cache: Dict[str, str] = {}

# ---------------------------------------------------------------------------
# Static fund data
# ---------------------------------------------------------------------------

FUND_HOLDINGS = {
    "HDFC Top 100": ["Reliance Industries", "HDFC Bank", "ICICI Bank", "Infosys", "TCS"],
    "SBI Bluechip": ["HDFC Bank", "ICICI Bank", "Reliance Industries", "Infosys", "Larsen & Toubro"],
    "Mirae Asset Large Cap": ["HDFC Bank", "Reliance Industries", "ICICI Bank", "TCS", "Infosys"],
    "Axis Bluechip": ["Bajaj Finance", "HDFC Bank", "Reliance Industries", "TCS", "ICICI Bank"],
    "Parag Parikh Flexi Cap": ["HDFC Bank", "ICICI Bank", "Bajaj Holdings", "Maruti Suzuki", "ITC"],
    "Nippon India Small Cap": ["KPIT Tech", "Tube Investments", "Navin Fluorine", "Balaji Amines", "Tanla Platforms"],
    "HDFC Mid-Cap Opportunities": ["Tube Investments", "KPIT Tech", "Bharat Forge", "Sundram Fasteners", "Max Healthcare"],
    "Axis Midcap": ["Cholamandalam Investment", "Bharat Electronics", "Bata India", "Schaeffler India", "AU Small Finance Bank"],
    "Kotak Emerging Equity": ["Bharat Electronics", "Solar Industries", "Supreme Industries", "Cholamandalam Investment", "SKF India"],
    "HDFC Balanced Advantage": ["HDFC Bank", "ICICI Bank", "Reliance Industries", "Infosys", "TCS"],
    "ICICI Pru Balanced Advantage": ["HDFC Bank", "ICICI Bank", "Reliance Industries", "Infosys", "TCS"],
    "SBI Equity Hybrid": ["HDFC Bank", "Reliance Industries", "ICICI Bank", "Infosys", "TCS"],
    "Mirae Asset Hybrid Equity": ["HDFC Bank", "Reliance Industries", "ICICI Bank", "Infosys", "TCS"],
    "Nippon India Liquid": ["TREPS", "GOI T-Bills", "Commercial Paper", "Certificate of Deposit"],
    "HDFC Liquid": ["TREPS", "GOI T-Bills", "Commercial Paper", "Certificate of Deposit"],
}

FUND_EXPENSE_RATIOS = {
    "HDFC Top 100": 1.18,
    "SBI Bluechip": 0.89,
    "Mirae Asset Large Cap": 0.55,
    "Axis Bluechip": 0.53,
    "Parag Parikh Flexi Cap": 0.63,
    "Nippon India Small Cap": 0.68,
    "HDFC Mid-Cap Opportunities": 0.77,
    "Axis Midcap": 0.54,
    "Kotak Emerging Equity": 0.48,
    "HDFC Balanced Advantage": 1.12,
    "ICICI Pru Balanced Advantage": 1.03,
    "SBI Equity Hybrid": 1.02,
    "Mirae Asset Hybrid Equity": 0.60,
    "Nippon India Liquid": 0.20,
    "HDFC Liquid": 0.20,
}

FUND_CATEGORIES = {
    "HDFC Top 100": "Large Cap",
    "SBI Bluechip": "Large Cap",
    "Mirae Asset Large Cap": "Large Cap",
    "Axis Bluechip": "Large Cap",
    "Parag Parikh Flexi Cap": "Flexi Cap",
    "Nippon India Small Cap": "Small Cap",
    "HDFC Mid-Cap Opportunities": "Mid Cap",
    "Axis Midcap": "Mid Cap",
    "Kotak Emerging Equity": "Mid Cap",
    "HDFC Balanced Advantage": "Hybrid",
    "ICICI Pru Balanced Advantage": "Hybrid",
    "SBI Equity Hybrid": "Hybrid",
    "Mirae Asset Hybrid Equity": "Hybrid",
    "Nippon India Liquid": "Liquid",
    "HDFC Liquid": "Liquid",
}

NIFTY_50_RETURNS = {"1yr": 12.3, "3yr": 14.1, "5yr": 13.8}

# ---------------------------------------------------------------------------
# Lines we must never treat as a fund name
# ---------------------------------------------------------------------------
_SKIP_LINE_TOKENS = {
    "folio", "statement", "summary", "page", "date", "amount", "nav",
    "units", "balance", "closing", "opening", "transaction", "advisor",
    "broker", "arn", "pan", "email", "mobile", "address", "investor",
    "period", "from", "to", "total", "sub", "isin", "scheme", "plan",
    "option", "dividend", "cumulative", "growth", "direct", "regular",
    "consolidated", "account", "number", "holdings", "value", "report",
    "generated", "downloaded", "print", "kfintech", "cams", "karvy",
    # Additional rejects for SBI statements
    "partner", "life", "mode", "holding", "single", "status", "individual",
    "second", "holder", "third", "guardian", "nominee", "exchange",
    "instalment", "installment", "bse", "nse", "partner", "for life",
    "statement of account", "page", "of", "nav as on", "as on",
}

# These tokens ALWAYS reject a line, regardless of other content
_HARD_REJECT_TOKENS = {
    "statement of account", "option:", "idcw", "payout", 
    "instruction", "overleaf", "please refer", "growth n", "please"
}

# Tokens that strongly indicate a real fund name line
_FUND_KEYWORDS = {
    "fund", "equity", "debt", "hybrid", "liquid", "balanced", "growth",
    "direct", "regular", "flexi", "large cap", "mid cap", "small cap",
    "bluechip", "opportunities", "advantage", "emerging", "index",
    "nifty", "sensex", "gilt", "overnight", "arbitrage", "multi cap",
    "contra", "savings", "sbi", "hdfc", "icici", "axis", "kotak",
}


def _is_fund_name_line(line: str) -> bool:
    """
    Return True only when the line looks like an actual fund name.
    Rejects headers, footers, column labels, and numeric-heavy lines.
    """
    lower = line.lower()

    # HARD REJECT: These tokens mean it's definitely NOT a fund name
    for reject in _HARD_REJECT_TOKENS:
        if reject in lower:
            return False

    # Must not be a known non-fund token at word level
    words = set(re.findall(r"[a-z]+", lower))
    if words & _SKIP_LINE_TOKENS and not (words & _FUND_KEYWORDS):
        return False

    # Must not start with a date or number
    if re.match(r"^\d", line.strip()):
        return False

    # Must contain at least one fund keyword
    if not any(kw in lower for kw in _FUND_KEYWORDS):
        return False

    # Must be mostly alphabetic (fund names don't have lots of digits)
    alpha_chars = sum(c.isalpha() or c.isspace() for c in line)
    if len(line) > 0 and alpha_chars / len(line) < 0.6:
        return False

    return True


# ---------------------------------------------------------------------------
# Date parsing helpers
# ---------------------------------------------------------------------------

# CAMS uses DD-Mon-YYYY  e.g. 15-Jan-2024
_CAMS_DATE_RE = re.compile(r"\b(\d{1,2}-[A-Za-z]{3}-\d{4})\b")
# KFintech uses DD/MM/YYYY  e.g. 15/01/2024
_KFIN_DATE_RE = re.compile(r"\b(\d{1,2}/\d{1,2}/\d{4})\b")
# Generic DD-MM-YYYY
_GEN_DATE_RE  = re.compile(r"\b(\d{1,2}-\d{1,2}-\d{4})\b")


def _parse_date(date_str: str) -> Optional[datetime]:
    for fmt in ("%d-%b-%Y", "%d/%m/%Y", "%d-%m-%Y", "%d %b %Y"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def _detect_format(full_text: str) -> str:
    """Return 'cams' or 'kfintech' based on PDF text content."""
    lower = full_text.lower()
    if "kfintech" in lower or "karvy" in lower:
        return "kfintech"
    return "cams"


# ---------------------------------------------------------------------------
# Transaction-line patterns
# ---------------------------------------------------------------------------

# Each pattern yields named groups: date_str, units, nav, amount, txn_type
# We compile once for performance.

# CAMS: DD-Mon-YYYY type amount units nav (SBI format)
_TXN_CAMS = re.compile(
    r"(?P<date_str>\d{1,2}-[A-Za-z]{3}-\d{4})"
    r"\s+(?P<txn_type>(?:Systematic Transfer Plan|Switch In|Purchase|Redemption|SIP|SWP|Reinvestment|Switch Out|Buy|Sell|STP|Dividend Reinvest)[^\d]*)"
    r"\s+(?P<amount>[\d,]+\.?\d*)"
    r"\s+(?P<units>[\d,]+\.?\d*)"
    r"\s+(?P<nav>[\d,]+\.?\d*)",
    re.IGNORECASE,
)

# KFintech: DD/MM/YYYY  type  amount  units  nav
_TXN_KFIN = re.compile(
    r"(?P<date_str>\d{1,2}/\d{1,2}/\d{4})"
    r"\s+(?P<txn_type>Purchase|Redemption|SIP|SWP|Reinvestment|Switch In|Switch Out|Buy|Sell|Systematic Transfer Plan|Systematic Transfer|Transfer In|Transfer Out|STP|Dividend Reinvest)"
    r"\s+(?P<amount>[\d,]+\.?\d*)"
    r"\s+(?P<units>[\d,]+\.?\d*)"
    r"\s+(?P<nav>[\d,]+\.?\d*)",
    re.IGNORECASE,
)

# Generic fallback: date anywhere, then 3 numbers, then optional type
_TXN_GENERIC = re.compile(
    r"(?P<date_str>\d{1,2}[-/]\d{1,2}[-/]\d{2,4})"
    r".*?"
    r"(?P<amount>[\d,]+\.\d{2})"   # amount always has 2 decimal places
    r"\s+(?P<nav>[\d,]+\.\d{4})"   # NAV has 4 decimal places typically
    r"\s+(?P<units>[\d,]+\.\d{3})", # units have 3 decimal places
    re.IGNORECASE,
)

_BUY_KEYWORDS  = {
    "purchase", "buy",
    "sip", "systematic investment",
    "reinvestment", "dividend reinvest",
    "switch in", "transfer in",
    "stp in", "systematic transfer plan", "systematic transfer"
}
_SELL_KEYWORDS = {
    "redemption", "sell",
    "swp", "systematic withdrawal",
    "switch out", "transfer out",
    "stp out"
}


def _parse_transaction_line(line: str, fmt: str) -> Optional[Dict]:
    """
    Try to extract one transaction from a line.
    Returns a dict or None.
    """
    patterns = [_TXN_CAMS, _TXN_KFIN] if fmt == "cams" else [_TXN_KFIN, _TXN_CAMS]
    patterns.append(_TXN_GENERIC)

    for pat in patterns:
        m = pat.search(line)
        if not m:
            continue

        groups = m.groupdict()
        date = _parse_date(groups["date_str"])
        if date is None:
            continue

        try:
            units  = float(groups["units"].replace(",", ""))
            nav    = float(groups["nav"].replace(",", ""))
            amount = float(groups["amount"].replace(",", ""))
        except (ValueError, KeyError):
            continue

        # Determine buy vs sell
        raw_type = groups.get("txn_type", "purchase").lower().strip()
        if any(k in raw_type for k in _BUY_KEYWORDS):
            txn_type = "buy"
        elif any(k in raw_type for k in _SELL_KEYWORDS):
            txn_type = "sell"
        else:
            # If we can't tell from a label, infer from sign conventions
            txn_type = "buy"

        if txn_type == "sell":
            units  = -abs(units)
            amount = -abs(amount)

        return {
            "date":   date,
            "units":  units,
            "nav":    nav,
            "amount": amount,
            "type":   txn_type,
        }

    return None

# Main parser
# ---------------------------------------------------------------------------

def parse_cams_pdf(file_bytes: bytes) -> List[Dict]:
    """
    Parse CAMS or KFintech mutual fund statement PDF.

    Returns a list of transactions:
        fund_name  : str
        date       : datetime
        units      : float  (negative for sells)
        nav        : float
        amount     : float  (negative for sells)
        type       : 'buy' | 'sell'
    """
    transactions: List[Dict] = []
    current_fund: Optional[str] = None
    debug_lines = []  # Collect sample lines for debugging

    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            print(f"[DEBUG] Total pages: {len(pdf.pages)}")
            
            # Check which pages have text
            for i, p in enumerate(pdf.pages[:3]):  # Check first 3 pages
                txt = p.extract_text()
                print(f"[DEBUG] Page {i+1} text length: {len(txt) if txt else 0}")

            # --- detect format from first page ---
            first_text = pdf.pages[0].extract_text() or ""
            fmt = _detect_format(first_text)
            print(f"[DEBUG] Detected format: {fmt}")

            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                if not text:
                    continue
                
                print(f"[DEBUG] Processing page {page_num + 1}")

                for line_num, raw_line in enumerate(text.split("\n")):
                    line = raw_line.strip()
                    if not line or len(line) < 8:
                        continue
                    
                    # Collect sample lines for debugging
                    if page_num == 0 and len(debug_lines) < 50:
                        debug_lines.append(line)
                    
                    # Also specifically capture lines that look like they might be transactions
                    if re.search(r'\d{1,2}[-/]', line) and re.search(r'\d+\.\d+', line):
                        print(f"[DEBUG] P{page_num+1} Potential txn: {line[:100]}")

                    # ---- Step 1: try to parse as a transaction line ----
                    txn = _parse_transaction_line(line, fmt)
                    if txn is not None and current_fund is not None:
                        txn["fund_name"] = current_fund
                        transactions.append(txn)
                        print(f"[DEBUG] Found transaction: {txn['type']} {txn['amount']} in {current_fund}")
                        continue

                    # ---- Step 2: check if this is a new fund header ----
                    if _is_fund_name_line(line):
                        candidate = re.sub(r"\s+", " ", line).strip()
                        # Strip trailing metadata like "(ISIN: INF123...)"
                        candidate = re.sub(r"\(ISIN[^)]*\)", "", candidate).strip()
                        # Strip folio references
                        candidate = re.sub(r"\s*-\s*Folio.*$", "", candidate, flags=re.IGNORECASE).strip()
                        candidate = re.sub(r"\s*-\s*L\d+[A-Z].*$", "", candidate, flags=re.IGNORECASE).strip()
                        # Strip NAV info
                        candidate = re.sub(r"\s*NAV\s+as\s+on.*$", "", candidate, flags=re.IGNORECASE).strip()
                        candidate = re.sub(r"\s*:?\s*\d+\.\d+$", "", candidate).strip()  # trailing NAV number
                        # Strip exchange/installment info
                        candidate = re.sub(r"\s*-\s*(BSE|NSE|Exchange).*$", "", candidate, flags=re.IGNORECASE).strip()
                        candidate = re.sub(r"\s*-\s*Instalment.*$", "", candidate, flags=re.IGNORECASE).strip()
                        candidate = re.sub(r"\s*-\s*Reg\s+Gr.*$", "", candidate, flags=re.IGNORECASE).strip()
                        if len(candidate) > 8:
                            # Normalize fund name if it starts with a code like "L036G"
                            candidate = re.sub(r"^L\d+[A-Z]\s+", "", candidate).strip()
                            current_fund = candidate
                            print(f"[DEBUG] Found fund: {current_fund}")

    except Exception as exc:
        print(f"PDF parsing failed: {exc}. Returning empty transaction list.")
        return []
    
    if not transactions:
        print(f"[DEBUG] No transactions found. Sample lines from PDF:")
        for i, line in enumerate(debug_lines[:10]):
            print(f"  Line {i+1}: {line[:80]}...")

    return transactions


# ---------------------------------------------------------------------------
# NAV fetching
# ---------------------------------------------------------------------------

def get_current_nav(fund_name: str) -> float:
    """Fetch current NAV for a fund from mfapi.in, with 1-hour cache."""
    if fund_name in _nav_cache:
        cached = _nav_cache[fund_name]
        if (datetime.now() - cached["timestamp"]).seconds < 3600:
            return cached["nav"]

    try:
        search_url = f"https://api.mfapi.in/mf/search?q={fund_name}"
        resp = requests.get(search_url, timeout=10)
        resp.raise_for_status()
        results = resp.json()
        if not results:
            return 25.0

        scheme_code = results[0]["schemeCode"]
        nav_resp = requests.get(f"https://api.mfapi.in/mf/{scheme_code}", timeout=10)
        nav_resp.raise_for_status()
        nav_data = nav_resp.json()
        latest_nav = float(nav_data["data"][0]["nav"])

        _nav_cache[fund_name] = {"nav": latest_nav, "timestamp": datetime.now()}
        return latest_nav

    except Exception:
        return 25.0


# ---------------------------------------------------------------------------
# XIRR
# ---------------------------------------------------------------------------

def calculate_xirr(transactions: List[Dict], current_value: float) -> float:
    """
    Calculate XIRR for a series of transactions plus current market value.
    Returns annualised return as a percentage (e.g. 14.5 for 14.5%).
    """
    if not transactions:
        return 0.0

    cashflows = []
    dates = []

    for txn in transactions:
        # Money out (buy) is negative; money in (sell) is positive
        cf = -abs(txn["amount"]) if txn["type"] == "buy" else abs(txn["amount"])
        cashflows.append(cf)
        dates.append(txn["date"])

    # Current value is the final positive cashflow
    cashflows.append(current_value)
    dates.append(datetime.now())

    try:
        rate = npf.xirr(cashflows, dates)
        return round(rate * 100, 2)
    except Exception:
        pass

    # Fallback: simple CAGR
    try:
        total_invested = sum(abs(t["amount"]) for t in transactions if t["type"] == "buy")
        if total_invested == 0:
            return 0.0
        first_date = min(t["date"] for t in transactions)
        years = (datetime.now() - first_date).days / 365.25
        if years == 0:
            return 0.0
        cagr = (current_value / total_invested) ** (1 / years) - 1
        return round(cagr * 100, 2)
    except Exception:
        return 0.0


# ---------------------------------------------------------------------------
# Overlap analysis
# ---------------------------------------------------------------------------

def calculate_overlap(fund_names: List[str]) -> Dict:
    """
    Calculate stock overlap between every pair of funds in the portfolio.
    Uses hardcoded top-5 holdings; falls back to synthetic names for unknowns.
    """
    portfolio_holdings: Dict[str, List[str]] = {}
    for fund in fund_names:
        matched = next(
            (k for k in FUND_HOLDINGS if k.lower() in fund.lower() or fund.lower() in k.lower()),
            None,
        )
        portfolio_holdings[fund] = (
            FUND_HOLDINGS[matched] if matched else [f"Stock_{i}_{fund[:5]}" for i in range(5)]
        )

    fund_list = list(portfolio_holdings.keys())
    pairs = []
    all_stocks: set = set()
    total_stocks = 0
    max_overlap = 0
    max_overlap_pair = None

    for i in range(len(fund_list)):
        for j in range(i + 1, len(fund_list)):
            a, b = fund_list[i], fund_list[j]
            ha = set(portfolio_holdings[a])
            hb = set(portfolio_holdings[b])
            common = ha & hb
            union  = ha | hb
            pct = round(len(common) / len(union) * 100, 1) if union else 0

            pairs.append({"fund_a": a, "fund_b": b, "common_stocks": list(common), "overlap_pct": pct})
            if pct > max_overlap:
                max_overlap = pct
                max_overlap_pair = f"{a} & {b}"

            all_stocks |= ha | hb
            total_stocks += len(ha) + len(hb)

    return {
        "pairs": pairs,
        "most_overlapping_pair": max_overlap_pair or "None",
        "unique_stock_count": len(all_stocks),
        "total_stock_count": total_stocks,
    }


# ---------------------------------------------------------------------------
# Expense drag
# ---------------------------------------------------------------------------

def calculate_expense_drag(holdings: List[Dict], corpus: float) -> Dict:
    """
    Project 20-year wealth loss due to expense ratios vs a 0.1% index fund.
    Assumes 12% gross return before expenses.
    """
    if not holdings or corpus == 0:
        return {"avg_expense_ratio": 0, "projected_loss_20yr": 0, "index_fund_saving": 0}

    weighted_er = 0.0
    for h in holdings:
        er = h.get("expense_ratio")
        if er is None:
            matched = next(
                (v for k, v in FUND_EXPENSE_RATIOS.items()
                 if k.lower() in h["fund_name"].lower() or h["fund_name"].lower() in k.lower()),
                1.0,
            )
            er = matched
        weight = h.get("current_value", 0) / corpus
        weighted_er += weight * er

    avg_er = round(weighted_er, 2)
    gross  = 1.12
    years  = 20

    portfolio_value  = corpus * (gross - avg_er / 100) ** years
    index_value      = corpus * (gross - 0.001) ** years
    loss             = max(0, index_value - portfolio_value)

    return {
        "avg_expense_ratio":  avg_er,
        "projected_loss_20yr": round(loss),
        "index_fund_saving":   round(loss),
    }


# ---------------------------------------------------------------------------
# Benchmark comparison
# ---------------------------------------------------------------------------

def get_benchmark_comparison(fund_names: List[str], xirr: float) -> Dict:
    """Compare portfolio XIRR against an appropriate Nifty 50 timeframe return."""
    equity_cats = {"Large Cap", "Mid Cap", "Small Cap", "Flexi Cap"}
    categories = []
    for fund in fund_names:
        cat = next(
            (v for k, v in FUND_CATEGORIES.items()
             if k.lower() in fund.lower() or fund.lower() in k.lower()),
            "Large Cap",
        )
        categories.append(cat)

    if any(c in equity_cats for c in categories):
        benchmark = NIFTY_50_RETURNS["5yr"]
    elif "Hybrid" in categories:
        benchmark = NIFTY_50_RETURNS["3yr"]
    else:
        benchmark = NIFTY_50_RETURNS["1yr"]

    alpha = round(xirr - benchmark, 2)
    return {
        "portfolio_xirr":        xirr,
        "benchmark_return":      benchmark,
        "alpha":                 alpha,
        "is_beating_benchmark":  alpha > 0,
    }


# ---------------------------------------------------------------------------
# Gemini cache helpers
# ---------------------------------------------------------------------------

def get_gemini_cache_key(input_data: str) -> str:
    return hashlib.md5(input_data.encode()).hexdigest()


def get_cached_gemini_response(input_data: str) -> Optional[str]:
    return _gemini_cache.get(get_gemini_cache_key(input_data))


def cache_gemini_response(input_data: str, response: str) -> None:
    _gemini_cache[get_gemini_cache_key(input_data)] = response
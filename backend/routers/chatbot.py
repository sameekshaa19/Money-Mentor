"""
Chatbot router using Groq API (fast, reliable, no CORS issues).
Get free API key at: https://console.groq.com/keys
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# GROQ Configuration
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# Add your Groq API key here or set GROQ_API_KEY env variable
GROQ_API_KEY = "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"  # Replace with your key from console.groq.com

# Free tier model options (pick one):
# - "llama-3.1-8b-instant" (fast, good quality)
# - "llama-3.1-70b-versatile" (better quality)
# - "mixtral-8x7b-32768" (good balance)
GROQ_MODEL = "llama-3.1-8b-instant"

class ChatRequest(BaseModel):
    message: str
    history: list = []
    context: dict = None
    page: str = "general"

class ChatResponse(BaseModel):
    response: str
    demo_mode: bool = False

@router.post("/generate", response_model=ChatResponse)
async def generate_chat(request: ChatRequest):
    """Proxy chat request to Groq API or return demo response."""
    
    api_key = GROQ_API_KEY
    
    # Demo mode if no key
    if not api_key or api_key == "gsk_YOUR_GROQ_API_KEY":
        demo_resp = get_demo_response(request.message, request.context, request.page)
        return ChatResponse(response=demo_resp, demo_mode=True)
    
    # Build messages for Groq
    system_prompt = build_system_prompt(request.context, request.page)
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add recent history
    for msg in request.history[-4:]:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })
    
    # Add current question
    messages.append({"role": "user", "content": request.message})
    
    # Call Groq API
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(GROQ_API_URL, headers=headers, json=payload)
            
            if response.status_code != 200:
                error_text = response.text
                raise HTTPException(status_code=502, detail=f"Groq API error: {response.status_code} - {error_text}")
            
            result = response.json()
            
            # Extract response text
            if "choices" in result and len(result["choices"]) > 0:
                text = result["choices"][0].get("message", {}).get("content", "")
            else:
                text = "I could not generate a response."
            
            return ChatResponse(response=text.strip(), demo_mode=False)
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

def build_system_prompt(context, page):
    """Build system prompt with context."""
    fmt = lambda n: f"₹{int(n):,}" if n else "not provided"
    
    context_block = ""
    if page == "couples" and context:
        context_block = f"User is on Couples Planner. "
        if context.get("hra"):
            hra = context["hra"]
            context_block += f"HRA: {hra.get('recommended_claimant')} should claim, saves {fmt(hra.get('max_tax_saved'))}/year. "
        if context.get("nps"):
            context_block += f"NPS saves {fmt(context['nps'].get('total_household_saving'))}/year. "
    
    if page == "xray" and context:
        context_block = f"User is on Portfolio X-Ray. Portfolio value: {fmt(context.get('total_value'))}. "
    
    if page == "fire" and context:
        context_block = f"User is on FIRE Planner. Target corpus: {fmt(context.get('fire_number'))}. "
    
    return f"""You are Money Mentor, a friendly Indian personal finance assistant. Be concise (2-4 sentences), warm, and specific to the user's situation.

{context_block}

JARGON GUIDE:
- HRA = House Rent Allowance (tax-free salary component for rent)
- NPS = National Pension System (retirement savings, extra ₹50k deduction)
- SIP = Systematic Investment Plan (monthly auto-investing)
- XIRR = actual annualized return
- LTCG = 12.5% tax on equity gains above ₹1.25L/year
- Expense Ratio = fund management fee
- Fund Overlap = same stocks in different funds
- FIRE = Financial Independence Retire Early"""

def get_demo_response(question, context, page):
    """Return demo response when no HF token."""
    q = question.lower()
    
    if "hra" in q:
        if page == "couples" and context and context.get("hra"):
            claimant = context["hra"].get("recommended_claimant", "Partner")
            saved = context["hra"].get("max_tax_saved", 0)
            return f"{claimant} should claim HRA — saves ₹{int(saved):,}/year in taxes!"
        return "HRA = House Rent Allowance. Exemption is minimum of: actual HRA received, 50% of basic salary (metros), or rent paid minus 10% of basic."
    
    if "nps" in q:
        if page == "couples" and context and context.get("nps"):
            saved = context["nps"].get("total_household_saving", 0)
            return f"Both invest ₹50,000 in NPS under 80CCD(1B) → save ₹{int(saved):,}/year in taxes!"
        return "NPS gives extra ₹50,000 deduction under 80CCD(1B), beyond your 80C limit. Saves ₹15,000 if you're in 30% tax bracket."
    
    if "sip" in q:
        return "SIP (Systematic Investment Plan) means investing a fixed amount monthly. This is 'rupee cost averaging' — you buy more units when market is low, fewer when high. Best for long-term wealth building without timing the market."
    
    if "fire" in q:
        return "FIRE = Financial Independence Retire Early. You need 25-30x your annual expenses invested. The 4% rule says you can safely withdraw 4% yearly. In India, many prefer 3-3.5% due to higher inflation."
    
    if "overlap" in q:
        return "Fund overlap happens when multiple mutual funds hold the same stocks (like Reliance, HDFC Bank). This creates concentration risk instead of diversification. Check overlap using Portfolio X-Ray."
    
    if "xirr" in q:
        return "XIRR = Extended Internal Rate of Return. Unlike simple CAGR, XIRR accounts for WHEN you invested. Perfect for SIPs where you invest on different dates. Most accurate way to measure portfolio performance."
    
    if "tax regime" in q or "old tax" in q or "new tax" in q:
        return "Old tax regime: higher slab rates but deductions available (80C ₹1.5L, HRA, NPS extra ₹50k, home loan interest). New regime: lower rates, almost no deductions. Generally, if your deductions exceed ₹3.75L/year, old regime is better."
    
    if "expense" in q:
        return "Expense ratio is the annual fee charged by mutual funds. Index funds: 0.1-0.3%. Active funds: 0.5-2%. Over 20 years, a 1% higher expense ratio can cost you lakhs in returns!"
    
    if "mutual fund" in q:
        return "Mutual fund pools money from many investors to buy stocks/bonds professionally. Types: Equity (higher returns, volatile), Debt (stable, lower returns), Hybrid (balanced), Index (tracks market, low cost)."
    
    return "💰 Great question! I'm currently in demo mode. For AI-powered personalized answers, add a HuggingFace token (free at huggingface.co/settings/tokens) to your backend .env file as HF_TOKEN=your_token."

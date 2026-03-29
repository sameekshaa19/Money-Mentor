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
import os
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")  # Replace with your key from console.groq.com

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
    """Build warm, patient system prompt with full context from all features."""
    fmt = lambda n: f"₹{int(n):,}" if n else "not provided"
    fmt_pct = lambda n: f"{n}%" if n else "?"
    
    context_block = ""
    
    # Couples Planner data
    if page == "couples" and context:
        context_block += "📊 Couples Planner Data:\n"
        if context.get("hra"):
            hra = context["hra"]
            context_block += f"• HRA: {hra.get('recommended_claimant', 'Partner')} should claim → saves {fmt(hra.get('max_tax_saved'))}/year\n"
        if context.get("nps"):
            nps = context["nps"]
            context_block += f"• NPS: Combined saves {fmt(nps.get('total_household_saving'))}/year\n"
        if context.get("sip_split"):
            sip = context["sip_split"]
            context_block += f"• SIP: {sip.get('recommendation', '')}\n"
        if context.get("net_worth"):
            nw = context["net_worth"]
            context_block += f"• Net Worth: Combined {fmt(nw.get('combined_net_worth'))}\n"
    
    # Portfolio X-Ray data
    if page == "xray" and context:
        context_block += "📈 Portfolio X-Ray Data:\n"
        context_block += f"• Total Value: {fmt(context.get('total_value'))}\n"
        context_block += f"• XIRR: {fmt_pct(context.get('xirr'))}\n"
        context_block += f"• Expense Drag: {fmt(context.get('expense_drag'))}/year\n"
        if context.get("overlap_analysis"):
            ov = context["overlap_analysis"]
            context_block += f"• Fund Overlap: {ov.get('max_overlap', 0)}% between top funds\n"
    
    # FIRE Planner data
    if page == "fire" and context:
        context_block += "🔥 FIRE Planner Data:\n"
        context_block += f"• FIRE Number: {fmt(context.get('fire_number'))}\n"
        context_block += f"• Monthly Expenses: {fmt(context.get('monthly_expenses'))}\n"
        context_block += f"• Safe Withdrawal Rate: {context.get('swr', 4)}%\n"
        if context.get("years_to_fire"):
            context_block += f"• Years to FIRE: {context.get('years_to_fire')}\n"
    
    # Zindagi Goals data
    if page == "zindagi" and context:
        context_block += "🎯 Zindagi Goals Data:\n"
        if context.get("goals"):
            for g in context.get("goals", [])[:3]:
                context_block += f"• {g.get('name', 'Goal')}: Target {fmt(g.get('target_amount'))} by {g.get('target_year', '?')}\n"
    
    if not context_block:
        context_block = "User is exploring Money Mentor features. Be helpful and welcoming!"
    
    return f"""You are Money Mentor 🤖💰 — a warm, patient Indian personal finance companion.

TONE & STYLE:
• Be warm, encouraging, and patient — like a knowledgeable friend
• Explain concepts simply, step by step when needed
• Use emojis occasionally to feel friendly 😊
• Be concise but thorough (3-5 sentences)
• Always reference the user's actual numbers when available
• If data is missing, gently suggest they fill it in for personalized advice

USER CONTEXT:
{context_block}

JARGON GUIDE (explain simply):
• HRA = House Rent Allowance (tax-free part of salary for rent)
• NPS = National Pension System (extra ₹50k tax saving)
• SIP = Systematic Investment Plan (monthly investing, rupee cost averaging)
• XIRR = Your actual annual return (better than simple interest)
• FIRE = Financial Independence Retire Early (25-30x expenses saved)
• SWR = Safe Withdrawal Rate (4% rule for retirement)
• Expense Ratio = Fund's annual fee (lower is better)
• Fund Overlap = Same stocks in different funds (concentration risk)
• LTCG = Long Term Capital Gains tax (12.5% above ₹1.25L)

Remember: You're here to help Indians make smarter money decisions! 🇮🇳"""

def get_demo_response(question, context, page):
    """Return warm, personalized demo response using available data."""
    q = question.lower()
    fmt = lambda n: f"₹{int(n):,}" if n else "?"
    
    # HRA - with couples data
    if "hra" in q:
        if page == "couples" and context and context.get("hra"):
            hra = context["hra"]
            claimant = hra.get("recommended_claimant", "Partner")
            saved = hra.get("max_tax_saved", 0)
            return f"😊 Great question! Based on your Couples Planner data, **{claimant}** should claim the HRA. This will save you **{fmt(saved)}/year** in taxes! The HRA exemption is the minimum of: actual HRA received, 50% of basic (metro cities), or rent paid minus 10% of basic."
        return "🏠 **HRA (House Rent Allowance)** is a tax-free component of your salary for rent. The exemption is the minimum of three amounts: (1) actual HRA received, (2) 50% of basic salary for metro cities (40% for non-metro), or (3) rent paid minus 10% of basic salary. If you're a couple, I can suggest who should claim it for maximum tax savings!"
    
    # NPS - with couples data  
    if "nps" in q:
        if page == "couples" and context and context.get("nps"):
            saved = context["nps"].get("total_household_saving", 0)
            return f"🎯 Excellent! Based on your numbers, if both of you invest ₹50,000 in NPS under Section 80CCD(1B), you'll save **{fmt(saved)}/year** in taxes! This is above and beyond your ₹1.5L 80C limit."
        return "💰 **NPS (National Pension System)** gives you an extra ₹50,000 tax deduction under Section 80CCD(1B) — this is over and above your ₹1.5L 80C limit! At 30% tax bracket, that's ₹15,000 saved yearly. Plus, it's a great retirement investment with low costs!"
    
    # SIP
    if "sip" in q:
        return "📈 **SIP (Systematic Investment Plan)** is like a recurring deposit but for mutual funds! You invest a fixed amount every month — this is called 'rupee cost averaging.' When markets are down, you buy more units; when up, fewer units. Over time, this smooths out volatility and builds wealth without timing the market. Perfect for long-term goals!"
    
    # FIRE - with fire data
    if "fire" in q:
        if page == "fire" and context:
            fire_num = context.get("fire_number", 0)
            years = context.get("years_to_fire")
            if fire_num:
                resp = f"🔥 **FIRE (Financial Independence Retire Early)** — Based on your data, you need **{fmt(fire_num)}** as your FIRE corpus. "
                if years:
                    resp += f"At your current pace, you're looking at about **{years} years** to reach FIRE! "
                resp += "The 4% rule says you can safely withdraw 4% yearly. In India, many prefer 3-3.5% due to inflation."
                return resp
        return "🔥 **FIRE = Financial Independence Retire Early!** The idea is to save 25-30x your annual expenses, then live off the returns. The '4% rule' suggests you can safely withdraw 4% yearly. In India, due to inflation, many aim for 3-3.5% withdrawal rate."
    
    # XIRR - with xray data
    if "xirr" in q or "return" in q:
        if page == "xray" and context and context.get("xirr"):
            xirr = context.get("xirr", 0)
            return f"📊 Your portfolio's **XIRR is {xirr}%**! XIRR (Extended Internal Rate of Return) is the most accurate way to measure returns because it accounts for WHEN you invested. Unlike simple CAGR, it handles irregular investments — perfect for SIPs!"
        return "📊 **XIRR = Extended Internal Rate of Return.** Unlike simple interest, XIRR accounts for exactly WHEN each investment was made. This makes it perfect for SIPs where you invest on different dates. Upload your CAMS statement to Portfolio X-Ray to see your actual XIRR!"
    
    # Portfolio/Overlap - with xray data
    if "overlap" in q or "portfolio" in q:
        if page == "xray" and context:
            val = context.get("total_value", 0)
            expense = context.get("expense_drag", 0)
            return f"📈 Your portfolio value is **{fmt(val)}** with an expense drag of **{fmt(expense)}/year**. Fund overlap happens when multiple funds hold the same stocks — this creates concentration risk. Diversify across large, mid, small cap, debt, and international!"
        return "📈 **Fund Overlap** happens when multiple mutual funds hold the same stocks (like Reliance, HDFC Bank). This creates concentration risk instead of true diversification. Use Portfolio X-Ray to check overlap and get rebalancing suggestions!"
    
    # Goals - with zindagi data
    if "goal" in q or "zindagi" in q:
        if page == "zindagi" and context and context.get("goals"):
            goals = context.get("goals", [])
            if goals:
                g = goals[0]
                return f"🎯 I see you're planning for **{g.get('name', 'your goal')}**! Target: **{fmt(g.get('target_amount'))}** by {g.get('target_year', 'your target year')}. Breaking this down into monthly SIPs makes it achievable. Would you like me to calculate how much you need to invest monthly?"
        return "🎯 **Zindagi Goals** helps you plan for life's milestones — vacation, car, education, home! Breaking big goals into monthly SIPs makes them achievable. I'll calculate exactly how much to invest monthly based on your target amount and timeline."
    
    # Tax regime
    if "tax regime" in q or "old tax" in q or "new tax" in q:
        return "🧮 **Old vs New Tax Regime:**\n• **Old regime:** Higher slab rates BUT deductions available — 80C (₹1.5L), HRA, NPS extra ₹50k, home loan interest\n• **New regime:** Lower slab rates BUT almost no deductions\n\n💡 **Rule of thumb:** If your deductions exceed ₹3.75L/year, old regime is usually better. I can help you calculate which is optimal!"
    
    # Expense ratio
    if "expense" in q:
        if page == "xray" and context and context.get("expense_drag"):
            drag = context.get("expense_drag", 0)
            return f"💸 Your portfolio's **expense drag is {fmt(drag)}/year**! Expense ratio is the annual fee charged by mutual funds. Index funds: 0.1-0.3%, Active funds: 0.5-2%. Over 20 years, even a 1% difference can cost you lakhs!"
        return "💸 **Expense Ratio** is the annual fee charged by mutual funds. Index funds: 0.1-0.3%, Active funds: 0.5-2%. This might seem small, but over 20 years, even a 1% difference can cost you lakhs in returns! Lower is definitely better."
    
    # Mutual funds
    if "mutual fund" in q:
        return "🤝 **Mutual Funds** pool money from many investors to buy stocks/bonds professionally. Types:\n• **Equity:** Higher returns, more volatile\n• **Debt:** Stable, lower returns\n• **Hybrid:** Balanced mix\n• **Index:** Tracks market, lowest cost (my favorite for beginners!)"
    
    # Net worth - with couples data
    if "net worth" in q:
        if page == "couples" and context and context.get("net_worth"):
            nw = context["net_worth"].get("combined_net_worth", 0)
            return f"� Your combined net worth is **{fmt(nw)}**! Net worth = Assets minus Liabilities. It's the most important number in personal finance — track it monthly!"
        return "💎 **Net Worth = Assets - Liabilities.** It's the most important number in personal finance! Include all investments, property, savings, minus loans and debts. Track this monthly — growing net worth = financial health!"
    
    # Generic helpful response
    return "🤗 I'd love to help with that! I'm currently in demo mode with pre-written responses. For AI-powered answers that use your actual financial data, the backend needs to be configured with an API key. In the meantime, try asking about HRA, NPS, SIP, FIRE, XIRR, or expense ratios — I have detailed explanations ready!"

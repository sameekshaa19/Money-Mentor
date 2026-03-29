"""
All Gemini prompt templates — one place for the whole team to manage AI prompts.
"""

# ────────────────────── X-Ray (P1) ──────────────────────
XRAY_ANALYSIS_PROMPT = """
You are a SEBI-registered mutual-fund analyst AI.

Given the following portfolio data extracted from a CAMS / KFintech statement:
{portfolio_data}

Provide a comprehensive portfolio X-Ray that includes:
1. **Asset Allocation** — equity vs debt vs hybrid split with percentages.
2. **XIRR Performance** — annualised return for each fund & overall portfolio.
3. **Fund Overlap Analysis** — identify funds sharing >30 % common holdings.
4. **Expense Ratio Impact** — total annual cost in ₹ and drag on returns.
5. **Rebalancing Recommendations** — specific buy / sell / switch actions.

Return the response as valid JSON with keys:
asset_allocation, xirr, overlap, expense_impact, rebalancing
"""

# ────────────────────── Health Score (P2) ──────────────────────
HEALTH_SCORE_PROMPT = """
You are a personal-finance health advisor.

User profile:
{user_profile}

Evaluate the user on these 6 dimensions (score each 0-100):
1. Emergency Fund Adequacy
2. Debt-to-Income Ratio
3. Insurance Coverage
4. Investment Diversification
5. Savings Rate
6. Retirement Readiness

For each dimension provide: score, status (good/warning/critical), one-line insight.
Return valid JSON with key "dimensions" (list of objects) and "overall_score" (int).
"""

# ────────────────────── FIRE (P2) ──────────────────────
FIRE_PROMPT = """
You are a FIRE (Financial Independence, Retire Early) planning AI.

User inputs:
{user_inputs}

Calculate:
1. Target retirement corpus using the 4 % rule adjusted for Indian inflation (6 %).
2. Required monthly SIP to reach the target, assuming {expected_return}% annual return.
3. Year-by-year projected corpus growth array.
4. A short motivational narrative about their FIRE journey.

Return valid JSON with keys:
target_corpus, monthly_sip, yearly_projection (list), narrative (string).
"""

# ────────────────────── Goals (P3) ──────────────────────
GOALS_PROMPT = """
You are a goal-based financial planner.

User goals:
{goals_data}

For each goal calculate:
1. Required monthly SIP given timeline & expected return.
2. Current progress percentage.
3. Whether goals conflict (total SIP > available surplus).

Return valid JSON with keys:
goals (list with sip, progress, status per goal), has_conflict (bool), surplus_needed (number), insight (string with a 1-2 sentence recommendation).
"""

# ────────────────────── Life Events (P3) ──────────────────────
LIFE_EVENT_PROMPT = """
You are a financial impact analyst for major life events.

Life event: {event_type}
User details: {user_details}

Provide a before/after comparison covering:
1. Monthly cash-flow change
2. Insurance needs change
3. Emergency fund adjustment
4. Tax implications
5. Investment strategy shift

Return valid JSON with keys:
event, before (object), after (object), recommendations (list of strings).
"""

# ────────────────────── Couple Finance (P1) ──────────────────────
COUPLE_FINANCE_PROMPT = """
You are a joint-finance optimisation AI for Indian married couples.

Partner A profile: {partner_a}
Partner B profile: {partner_b}

Provide:
1. **Optimal tax regime** — old vs new for each partner, with projected savings.
2. **HRA optimisation** — who should claim, split recommendation.
3. **NPS strategy** — 80CCD(1B) usage, employer vs self contribution split.
4. **Joint investment plan** — combined SIP allocation across goals.
5. **Insurance adequacy** — family floater vs individual cover comparison.

Return valid JSON with keys:
tax_plan, hra, nps, joint_investments, insurance.
"""

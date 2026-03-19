# MoneyMentor Architecture

## Agentic Roles
- **X-Ray Analyst**: Specialist in parsing mutual fund statements and calculating performance metrics.
- **Health Advisor**: Rules-based engine for scoring financial habits, augmented by Gemini insights.
- **FIRE Strategist**: Long-term projection specialist for early retirement.
- **Couple Optimizer**: Tax and joint-finance expert for household optimization.

## Data Flow
1. **User Input / PDF Upload** → Frontend (React).
2. **API Call** → Backend (FastAPI).
3. **Logic Engine** → Calculation (Python/NumPy) + Contextualization (Gemini AI).
4. **Response** → Structured JSON for visualization (Recharts).

## Error Handling
- **Parsing Errors**: Graceful handling of malformed PDF statements.
- **API Failures**: Mock data fallbacks for all endpoints.
- **Validation**: Strict Pydantic models for all entry points.

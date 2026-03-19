# MoneyMentor - AI-Powered Personal Finance Advisor

MoneyMentor is a comprehensive financial planning tool built for the Modern Indian Investor. It combines rule-based financial logic with the power of Gemini AI to provide deep insights into your portfolio, retirement goals, and joint finances.

## Features

- **Portfolio X-Ray**: Upload your CAMS/KFintech PDF for an instant analysis of XIRR, asset allocation, and fund overlap.
- **Financial Health Score**: 6-dimension scoring (Emergency Fund, Debt, Insurance, Diversification, Savings, Retirement).
- **FIRE Calculator**: Plan your "Financial Independence, Retire Early" journey with projected corpus and SIP requirements.
- **Goal Planner**: Track multiple life goals and detect funding conflicts.
- **Life Events**: Analyze the financial impact of major life events (marriage, kids, job change).
- **Couple Finance**: Optimize taxes (HRA, NPS, 80C) and joint investments for couples.

## Tech Stack

- **Backend**: FastAPI (Python), Gemini 1.5 Flash API, pdfplumber, numpy-financial, scipy.
- **Frontend**: React (Vite), Tailwind CSS, Zustand, Recharts, Axios.

## Getting Started

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create `.env` from `.env.example` and add your `GEMINI_API_KEY`.
4. Run: `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. Run: `npm run dev`

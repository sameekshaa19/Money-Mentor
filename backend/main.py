"""
MoneyMentor — FastAPI Backend
Mounts all feature routers and configures CORS.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.xray import router as xray_router
from routes.health import router as health_router
from routes.fire import router as fire_router
from routes.goals import router as goals_router
from routes.events import router as events_router
from routes.couple import router as couple_router

app = FastAPI(
    title="MoneyMentor API",
    description="AI-powered personal finance advisor",
    version="1.0.0",
)

# --------------- CORS ---------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------- Routers ---------------
app.include_router(xray_router,   prefix="/api", tags=["X-Ray"])
app.include_router(health_router, prefix="/api", tags=["Health Score"])
app.include_router(fire_router,   prefix="/api", tags=["FIRE"])
app.include_router(goals_router,  prefix="/api", tags=["Goals"])
app.include_router(events_router, prefix="/api", tags=["Life Events"])
app.include_router(couple_router, prefix="/api", tags=["Couple"])


@app.get("/")
async def root():
    return {"message": "MoneyMentor API is running 🚀"}

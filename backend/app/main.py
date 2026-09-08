"""
ORBITA — AI PR Intelligence Agent
FastAPI Backend Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api import repositories, pull_requests, findings, analysis, webhooks, analytics

settings = get_settings()

app = FastAPI(
    title="ORBITA API",
    description="AI PR Intelligence Agent — Backend API",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(repositories.router, prefix="/repositories", tags=["repositories"])
app.include_router(pull_requests.router, prefix="/pull-requests", tags=["pull-requests"])
app.include_router(findings.router, prefix="/findings", tags=["findings"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "demo_mode": settings.DEMO_MODE,
        "llm_provider": settings.LLM_PROVIDER,
    }

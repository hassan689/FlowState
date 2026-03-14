"""
MASS (Flowstate) - Moment-Adaptive Study System API.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app

from app.api import auth, tasks, interactions, focus, adaptation, users
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    # shutdown if needed


app = FastAPI(
    title="MASS (Flowstate) API",
    description="Moment-Adaptive Study System - Intelligent study platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Prometheus metrics at /metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(interactions.router, prefix="/api/interactions", tags=["interactions"])
app.include_router(focus.router, prefix="/api/focus", tags=["focus"])
app.include_router(adaptation.router, prefix="/api/adaptation", tags=["adaptation"])


@app.get("/health")
async def health():
    return {"status": "ok"}

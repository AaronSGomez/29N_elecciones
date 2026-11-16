"""Entrypoint FastAPI para 29N_elecciones."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes_chat import router as chat_router
from app.core.config import get_settings
from app.core.security import SlidingWindowRateLimiter
from app.services.llm_service import LLMService
from app.services.qdrant_service import QdrantRAGService
from app.services.rag_service import RAGService
from app.services.telegram_service import TelegramBotWorker


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    qdrant = QdrantRAGService(settings)
    llm = LLMService(settings)
    rag = RAGService(settings, qdrant, llm)
    telegram = TelegramBotWorker(settings, rag)

    app.state.settings = settings
    app.state.qdrant = qdrant
    app.state.llm = llm
    app.state.rag = rag
    app.state.rate_limiter = SlidingWindowRateLimiter(settings.RATE_LIMIT_PER_MIN)

    telegram.start()
    try:
        yield
    finally:
        await telegram.stop()
        await llm.close()


settings = get_settings()
app = FastAPI(
    title="29N Elecciones RAG API",
    version="1.0.0",
    docs_url=None if settings.APP_ENV == "production" else "/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self'; "
        "img-src 'self' data:;"
    )
    return response


app.include_router(chat_router)

# Servir Frontend estático PRINT//CORE 5
frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if not frontend_dir.exists():
    frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"

if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

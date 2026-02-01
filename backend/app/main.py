"""
FastAPI application main entry point.
"""
import logging
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize logging before importing other modules
from app.core.logging_config import setup_logging
logger = setup_logging()

from app.database import connect_to_mongo, close_mongo_connection
from app.core.config import get_cors_origins, is_firebase_configured, settings
from app.core.firebase import init_firebase
from app.routers import habits, streaks, reflections, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Connect to MongoDB (non-blocking - app starts even if DB fails)
    try:
        logger.info("Starting application...")
        await connect_to_mongo()
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Don't raise - let app start so health check passes and you can see logs.
        # Fix MONGODB_URL in Railway Variables and redeploy.

    # Optional: Initialize Firebase Admin (skip on error so app still runs)
    if is_firebase_configured():
        try:
            init_firebase()
        except Exception as e:
            logger.warning(f"Firebase init failed (auth will be skipped): {e}")

    yield
    
    # Shutdown: Close MongoDB connection
    try:
        logger.info("Shutting down application...")
        await close_mongo_connection()
        logger.info("Successfully closed MongoDB connection")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")


# Create FastAPI application instance
app = FastAPI(
    title=settings.app_name,
    description="FastAPI application for Gen AI habit tracking with MongoDB integration",
    version=settings.app_version,
    lifespan=lifespan
)

# Configure CORS (set CORS_ORIGINS for production, e.g. https://your-app.vercel.app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log 422 validation errors so "save habit" failures show up in logs
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(
        "Request validation failed (422): path=%s method=%s errors=%s",
        request.url.path,
        request.method,
        exc.errors(),
    )
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# Include routers
app.include_router(habits.router)
app.include_router(streaks.router)
app.include_router(reflections.router)
# Admin router only when Firebase is configured (optional)
if is_firebase_configured():
    app.include_router(admin.router)


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name
    }

"""
FastAPI application main entry point.
"""
import logging
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize logging before importing other modules
from app.core.logging_config import setup_logging
logger = setup_logging()

from app.database import connect_to_mongo, close_mongo_connection
from app.core.config import settings
from app.routers import habits, streaks, reflections


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Connect to MongoDB
    try:
        logger.info("Starting application...")
        await connect_to_mongo()
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise
    
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(habits.router)
app.include_router(streaks.router)
app.include_router(reflections.router)


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

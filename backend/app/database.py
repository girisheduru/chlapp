"""
MongoDB database connection module using Motor (async driver).
"""
import logging
import traceback
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global MongoDB client instance
client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    """Create database connection."""
    global client
    try:
        logger.info(f"Connecting to MongoDB at {settings.mongodb_url}")
        # Use certifi for Atlas (mongodb+srv) - fixes SSL handshake in Railway/container environments
        kwargs = {}
        if "mongodb+srv" in settings.mongodb_url or "mongodb.net" in settings.mongodb_url:
            kwargs["tls"] = True
            kwargs["tlsCAFile"] = certifi.where()
            logger.info(f"Using certifi CA bundle: {certifi.where()}")
        client = AsyncIOMotorClient(settings.mongodb_url, **kwargs)
        # Test the connection
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB: {settings.mongodb_url}")
        
        # Create indexes for streaks collection (if they don't exist)
        db = client[settings.database_name]
        try:
            # Create compound unique index on userId and habitId
            await db.streaks.create_index(
                [("userId", 1), ("habitId", 1)],
                unique=True,
                name="userId_habitId_unique"
            )
            logger.info("Created index on streaks collection: userId_habitId_unique")
        except Exception as e:
            # Index might already exist, which is fine
            logger.debug(f"Index creation note: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise


async def close_mongo_connection():
    """Close database connection."""
    global client
    try:
        if client:
            client.close()
            logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")


def get_database():
    """Get database instance."""
    if client is None:
        logger.error("Database connection not initialized - client is None")
        raise RuntimeError("Database connection not initialized")
    logger.debug(f"Getting database instance: {settings.database_name}")
    return client[settings.database_name]

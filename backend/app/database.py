"""
MongoDB database connection module using Motor (async driver).
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

from app.core.config import settings

# Global MongoDB client instance
client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    """Create database connection."""
    global client
    try:
        client = AsyncIOMotorClient(settings.mongodb_url)
        # Test the connection
        await client.admin.command('ping')
        print(f"Connected to MongoDB: {settings.mongodb_url}")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance."""
    if client is None:
        raise RuntimeError("Database connection not initialized")
    return client[settings.database_name]

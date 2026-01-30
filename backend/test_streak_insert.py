"""
Test script to verify streak collection creation and insertion.
Run this to test if the streak API endpoints work correctly.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone

async def test_streak_insertion():
    """Test inserting a streak document."""
    # Connect to MongoDB
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['chl_datastore_db']
    
    print("Testing streak collection...")
    
    # Test data
    test_user_id = ObjectId('507f1f77bcf86cd799439011')
    test_habit_id = ObjectId('507f1f77bcf86cd799439012')
    check_in_datetime = datetime.now(timezone.utc)
    
    # Check if collection exists
    collections = await db.list_collection_names()
    print(f"Existing collections: {collections}")
    
    # Try to insert
    new_streak = {
        "userId": test_user_id,
        "habitId": test_habit_id,
        "currentStreak": 1,
        "longestStreak": 1,
        "lastCheckInDate": check_in_datetime,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc)
    }
    
    try:
        result = await db.streaks.insert_one(new_streak)
        print(f"✅ Successfully inserted streak with ID: {result.inserted_id}")
        
        # Verify it was inserted
        count = await db.streaks.count_documents({})
        print(f"✅ Total streaks in collection: {count}")
        
        # Find the inserted document
        doc = await db.streaks.find_one({"_id": result.inserted_id})
        print(f"✅ Retrieved document: {doc}")
        
        # List collections again
        collections_after = await db.list_collection_names()
        print(f"✅ Collections after insert: {collections_after}")
        
        # Clean up test document
        await db.streaks.delete_one({"_id": result.inserted_id})
        print("✅ Test document cleaned up")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_streak_insertion())

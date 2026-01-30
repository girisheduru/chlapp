"""
Migration script to convert ObjectId userId and habitId to strings in streaks collection.
This ensures consistency with the habits collection format.

Handles duplicates by merging or removing old ObjectId entries.
"""
import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def migrate_streaks():
    """Migrate streaks collection to use string userId and habitId."""
    try:
        logger.info("Starting migration of streaks collection...")
        
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Find all streaks
        streaks = await db.streaks.find({}).to_list(length=None)
        logger.info(f"Found {len(streaks)} streaks to process")
        
        # Group by string representation of userId/habitId
        grouped = {}
        for streak in streaks:
            user_id = streak.get("userId")
            habit_id = streak.get("habitId")
            
            # Convert to string for grouping
            user_id_str = str(user_id) if isinstance(user_id, ObjectId) else user_id
            habit_id_str = str(habit_id) if isinstance(habit_id, ObjectId) else habit_id
            
            key = (user_id_str, habit_id_str)
            
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(streak)
        
        logger.info(f"Found {len(grouped)} unique userId/habitId combinations")
        
        migrated_count = 0
        merged_count = 0
        deleted_count = 0
        skipped_count = 0
        
        for (user_id_str, habit_id_str), streak_list in grouped.items():
            if len(streak_list) == 1:
                # Single entry - just convert if needed
                streak = streak_list[0]
                needs_update = False
                update_data = {}
                
                if isinstance(streak.get("userId"), ObjectId):
                    update_data["userId"] = user_id_str
                    needs_update = True
                
                if isinstance(streak.get("habitId"), ObjectId):
                    update_data["habitId"] = habit_id_str
                    needs_update = True
                
                if needs_update:
                    await db.streaks.update_one(
                        {"_id": streak["_id"]},
                        {"$set": update_data}
                    )
                    migrated_count += 1
                    logger.info(f"Migrated streak _id: {streak['_id']}")
                else:
                    skipped_count += 1
            else:
                # Multiple entries - merge them
                logger.info(f"Found {len(streak_list)} duplicates for userId={user_id_str}, habitId={habit_id_str}")
                
                # Find the one with string format (preferred) or most recent
                string_entry = None
                objectid_entries = []
                
                for streak in streak_list:
                    if isinstance(streak.get("userId"), str) and isinstance(streak.get("habitId"), str):
                        string_entry = streak
                    else:
                        objectid_entries.append(streak)
                
                # If no string entry exists, convert the most recent ObjectId entry
                if not string_entry:
                    # Sort by updatedAt (most recent first)
                    objectid_entries.sort(
                        key=lambda x: x.get("updatedAt") or x.get("createdAt") or x["_id"],
                        reverse=True
                    )
                    string_entry = objectid_entries[0]
                    objectid_entries = objectid_entries[1:]
                    
                    # Convert to string
                    await db.streaks.update_one(
                        {"_id": string_entry["_id"]},
                        {"$set": {
                            "userId": user_id_str,
                            "habitId": habit_id_str
                        }}
                    )
                    logger.info(f"Converted ObjectId entry to string: _id={string_entry['_id']}")
                
                # Merge data from ObjectId entries into string entry
                for obj_entry in objectid_entries:
                    # Take the maximum streak values
                    string_streak = string_entry.get("currentStreak", 0)
                    string_longest = string_entry.get("longestStreak", 0)
                    obj_streak = obj_entry.get("currentStreak", 0)
                    obj_longest = obj_entry.get("longestStreak", 0)
                    
                    update_data = {}
                    if obj_streak > string_streak:
                        update_data["currentStreak"] = obj_streak
                    if obj_longest > string_longest:
                        update_data["longestStreak"] = obj_longest
                    
                    # Use most recent lastCheckInDate
                    string_date = string_entry.get("lastCheckInDate")
                    obj_date = obj_entry.get("lastCheckInDate")
                    if obj_date and (not string_date or obj_date > string_date):
                        update_data["lastCheckInDate"] = obj_date
                    
                    if update_data:
                        await db.streaks.update_one(
                            {"_id": string_entry["_id"]},
                            {"$set": update_data}
                        )
                        logger.info(f"Merged data from _id={obj_entry['_id']} into _id={string_entry['_id']}")
                    
                    # Delete the duplicate ObjectId entry
                    await db.streaks.delete_one({"_id": obj_entry["_id"]})
                    deleted_count += 1
                    logger.info(f"Deleted duplicate ObjectId entry: _id={obj_entry['_id']}")
                
                merged_count += 1
        
        logger.info(f"\nMigration complete!")
        logger.info(f"  - Migrated: {migrated_count} streaks")
        logger.info(f"  - Merged: {merged_count} duplicate groups")
        logger.info(f"  - Deleted: {deleted_count} duplicate entries")
        logger.info(f"  - Skipped: {skipped_count} streaks (already correct format)")
        
        # Verify migration
        logger.info("\nVerifying migration...")
        all_streaks = await db.streaks.find({}).to_list(length=None)
        objectid_count = 0
        for streak in all_streaks:
            if isinstance(streak.get("userId"), ObjectId) or isinstance(streak.get("habitId"), ObjectId):
                objectid_count += 1
                logger.warning(f"Found streak with ObjectId: _id={streak['_id']}")
        
        if objectid_count == 0:
            logger.info("✅ All streaks now use string format for userId and habitId")
        else:
            logger.warning(f"⚠️  {objectid_count} streaks still have ObjectId values")
        
        # Show final count
        final_count = await db.streaks.count_documents({})
        logger.info(f"\nFinal streak count: {final_count}")
        
        client.close()
        
    except Exception as e:
        logger.error(f"Error during migration: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise


if __name__ == "__main__":
    asyncio.run(migrate_streaks())

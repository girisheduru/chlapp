#!/usr/bin/env python3
"""
Migration script to populate checkInHistory for existing streaks.

For streaks that have lastCheckInDate and currentStreak but no checkInHistory,
this script calculates the consecutive check-in dates and populates the array.

Usage:
    python migrate_checkin_history.py [--dry-run]

Options:
    --dry-run    Show what would be migrated without making changes
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()


def get_mongo_url():
    """Get MongoDB URL from environment."""
    return os.getenv("MONGODB_URL", "mongodb://localhost:27017")


def get_database_name():
    """Get database name from environment."""
    return os.getenv("DATABASE_NAME", "chl_datastore_db")


async def migrate_checkin_history(dry_run: bool = False):
    """
    Migrate existing streaks to populate checkInHistory.
    
    For each streak with lastCheckInDate and currentStreak > 0 but empty checkInHistory:
    - Calculate consecutive dates going backwards from lastCheckInDate
    - Populate checkInHistory with those dates in YYYY-MM-DD format
    """
    mongo_url = get_mongo_url()
    db_name = get_database_name()
    
    print(f"Connecting to MongoDB: {mongo_url}")
    print(f"Database: {db_name}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE MIGRATION'}")
    print("-" * 60)
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Find all streaks
        streaks_cursor = db.streaks.find({})
        streaks = await streaks_cursor.to_list(length=None)
        
        print(f"Found {len(streaks)} total streaks")
        
        migrated = 0
        skipped = 0
        
        for streak in streaks:
            streak_id = streak.get("_id")
            user_id = streak.get("userId", "unknown")
            habit_id = streak.get("habitId", "unknown")
            current_streak = streak.get("currentStreak", 0)
            last_check_in = streak.get("lastCheckInDate")
            existing_history = streak.get("checkInHistory", [])
            
            # Skip if already has checkInHistory
            if existing_history and len(existing_history) > 0:
                print(f"  [SKIP] Streak {streak_id}: already has {len(existing_history)} entries in checkInHistory")
                skipped += 1
                continue
            
            # Skip if no lastCheckInDate or currentStreak
            if not last_check_in or current_streak <= 0:
                print(f"  [SKIP] Streak {streak_id}: no lastCheckInDate or currentStreak=0")
                skipped += 1
                continue
            
            # Calculate check-in dates
            if isinstance(last_check_in, datetime):
                last_date = last_check_in.date()
            else:
                # Try to parse if it's a string
                try:
                    last_date = datetime.fromisoformat(str(last_check_in).replace("Z", "+00:00")).date()
                except (ValueError, TypeError):
                    print(f"  [SKIP] Streak {streak_id}: could not parse lastCheckInDate: {last_check_in}")
                    skipped += 1
                    continue
            
            # Generate consecutive dates going backwards
            check_in_history = []
            for i in range(current_streak):
                date = last_date - timedelta(days=i)
                check_in_history.append(date.isoformat())
            
            # Sort in chronological order (oldest first)
            check_in_history.sort()
            
            print(f"  [MIGRATE] Streak {streak_id} (user: {user_id[:20]}..., habit: {habit_id[:20]}...)")
            print(f"            currentStreak: {current_streak}, lastCheckInDate: {last_date}")
            print(f"            checkInHistory: {check_in_history}")
            
            if not dry_run:
                # Update the document
                await db.streaks.update_one(
                    {"_id": streak_id},
                    {"$set": {"checkInHistory": check_in_history}}
                )
                print(f"            -> Updated!")
            else:
                print(f"            -> Would update (dry run)")
            
            migrated += 1
        
        print("-" * 60)
        print(f"Migration complete!")
        print(f"  Migrated: {migrated}")
        print(f"  Skipped: {skipped}")
        print(f"  Total: {len(streaks)}")
        
        if dry_run:
            print("\nThis was a DRY RUN. No changes were made.")
            print("Run without --dry-run to apply changes.")
        
    finally:
        client.close()


def main():
    """Main entry point."""
    dry_run = "--dry-run" in sys.argv or "-n" in sys.argv
    
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        sys.exit(0)
    
    asyncio.run(migrate_checkin_history(dry_run=dry_run))


if __name__ == "__main__":
    main()

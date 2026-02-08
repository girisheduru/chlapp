"""
Pydantic schemas for Streak-related models.
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import Optional


class StreakCreate(BaseModel):
    """Model for creating a new streak."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "userId": "user123",
                "habitId": "habit456",
                "currentStreak": 0,
                "longestStreak": 0
            }
        }
    )
    
    userId: str = Field(..., description="User ID (ObjectId)")
    habitId: str = Field(..., description="Habit ID (ObjectId)")
    currentStreak: int = Field(0, ge=0, description="Current streak count")
    longestStreak: int = Field(0, ge=0, description="Longest streak achieved")
    lastCheckInDate: Optional[datetime] = Field(None, description="Last check-in date/time (ISO datetime)")


class StreakUpdateRequest(BaseModel):
    """Model for updating a streak with check-in date and optional time."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "userId": "user123",
                "habitId": "habit456",
                "checkInDate": "2024-01-25",
                "checkInDateTime": "2024-01-25T14:30:00.000Z"
            }
        }
    )
    
    userId: str = Field(..., description="User ID (ObjectId)")
    habitId: str = Field(..., description="Habit ID (ObjectId)")
    checkInDate: str = Field(..., description="Check-in date in YYYY-MM-DD format")
    checkInDateTime: Optional[str] = Field(None, description="Optional ISO datetime of check-in (e.g. 2024-01-25T14:30:00.000Z)")


class StreakResponse(BaseModel):
    """Response model for streak data."""
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )
    
    currentStreak: int = Field(..., description="Current consecutive-day streak count")
    longestStreak: int = Field(..., description="Longest streak achieved")
    totalStones: int = Field(0, ge=0, description="Total stones (check-ins) in jar")
    lastCheckInDate: Optional[datetime] = Field(None, description="Last check-in date/time (ISO datetime)")
    checkInHistory: list[str] = Field(default_factory=list, description="List of check-in dates in YYYY-MM-DD format")


class BackfillCheckInsRequest(BaseModel):
    """Request model for backfilling missing check-ins in the current week."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "habitId": "habit456",
                "starting_idea": "Exercise daily"
            }
        }
    )

    habitId: Optional[str] = Field(None, description="Habit ID. Either habitId or starting_idea must be provided.")
    starting_idea: Optional[str] = Field(None, description="Starting idea / habit name to look up the habit. Either habitId or starting_idea must be provided.")


class BackfillCheckInsResponse(BaseModel):
    """Response model for backfill check-ins."""
    habitId: str = Field(..., description="The resolved habit ID")
    starting_idea: Optional[str] = Field(None, description="The starting idea of the resolved habit")
    filledDates: list[str] = Field(default_factory=list, description="List of dates (YYYY-MM-DD) that were backfilled")
    alreadyCheckedIn: list[str] = Field(default_factory=list, description="Dates in the current week that already had check-ins")
    streak: StreakResponse = Field(..., description="Updated streak after backfill")

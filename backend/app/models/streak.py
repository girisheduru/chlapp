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
    lastCheckInDate: Optional[date] = Field(None, description="Last check-in date")


class StreakUpdateRequest(BaseModel):
    """Model for updating a streak with check-in date."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "userId": "user123",
                "habitId": "habit456",
                "checkInDate": "2024-01-25"
            }
        }
    )
    
    userId: str = Field(..., description="User ID (ObjectId)")
    habitId: str = Field(..., description="Habit ID (ObjectId)")
    checkInDate: str = Field(..., description="Check-in date in YYYY-MM-DD format")


class StreakResponse(BaseModel):
    """Response model for streak data."""
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )
    
    currentStreak: int = Field(..., description="Current consecutive-day streak count")
    longestStreak: int = Field(..., description="Longest streak achieved")
    totalStones: int = Field(0, ge=0, description="Total stones (check-ins) in jar")
    lastCheckInDate: Optional[date] = Field(None, description="Last check-in date")

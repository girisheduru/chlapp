"""
Pydantic schemas for Streak-related models.
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
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
    
    userId: str = Field(..., description="User ID")
    habitId: str = Field(..., description="Habit ID")
    currentStreak: int = Field(0, ge=0, description="Current streak count")
    longestStreak: int = Field(0, ge=0, description="Longest streak achieved")


class StreakUpdate(BaseModel):
    """Model for updating a streak."""
    currentStreak: Optional[int] = Field(None, ge=0, description="Current streak count")
    longestStreak: Optional[int] = Field(None, ge=0, description="Longest streak achieved")
    lastCheckIn: Optional[datetime] = Field(None, description="Last check-in timestamp")


class StreakResponse(BaseModel):
    """Response model for streak data."""
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )
    
    id: str = Field(..., alias="_id")
    userId: str
    habitId: str
    currentStreak: int
    longestStreak: int
    lastCheckIn: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

"""
Pydantic schemas for Habit-related models.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class HabitPreferences(BaseModel):
    """Habit preferences model."""
    starting_idea: Optional[str] = Field(None, description="Starting idea for the habit")
    identity: Optional[str] = Field(None, description="Identity associated with the habit")
    enjoyment: Optional[str] = Field(None, description="Enjoyment level or description")
    starter_habit: Optional[str] = Field(None, description="Starter habit option")
    full_habit: Optional[str] = Field(None, description="Full habit expression")
    habit_stack: Optional[str] = Field(None, description="Habit stacking information")
    habit_environment: Optional[str] = Field(None, description="Habit environment details")


class HabitPreferenceCreate(BaseModel):
    """Model for creating/updating habit preferences."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "userId": "user123",
                "habitId": "habit456",
                "preferences": {
                    "starting_idea": "I want to exercise more",
                    "identity": "I am a healthy person",
                    "enjoyment": "I enjoy running",
                    "starter_habit": "Put on running shoes",
                    "full_habit": "Run for 30 minutes every morning",
                    "habit_stack": "After morning coffee, I will run",
                    "habit_environment": "Prepare running gear the night before"
                }
            }
        }
    )
    
    userId: str = Field(..., description="User ID")
    habitId: str = Field(..., description="Habit ID")
    preferences: HabitPreferences = Field(..., description="Habit preferences")


class HabitPreferenceResponse(BaseModel):
    """Response model for habit preferences."""
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )
    
    id: str = Field(..., alias="_id")
    userId: str
    habitId: str
    preferences: HabitPreferences
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class IdentityGenerationRequest(BaseModel):
    """Request model for generating identities."""
    userId: str = Field(..., description="User ID")
    habitId: str = Field(..., description="Habit ID")


class IdentityGenerationResponse(BaseModel):
    """Response model for generated identities."""
    identities: list[str] = Field(..., description="List of generated identities")


class HabitOptionRequest(BaseModel):
    """Request model for generating habit options."""
    userId: str = Field(..., description="User ID")
    habitId: str = Field(..., description="Habit ID")


class HabitOptionResponse(BaseModel):
    """Response model for generated habit options."""
    options: list[str] = Field(..., description="List of generated habit options")


class ObviousCueRequest(BaseModel):
    """Request model for generating obvious cues."""
    userId: str = Field(..., description="User ID")
    habitId: str = Field(..., description="Habit ID")


class ObviousCueResponse(BaseModel):
    """Response model for generated obvious cues."""
    cues: list[str] = Field(..., description="List of generated obvious cues")

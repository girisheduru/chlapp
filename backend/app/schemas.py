"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime
from bson import ObjectId


class DataModel(BaseModel):
    """
    Pydantic model with exactly 8 fields for data storage.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "age": 30,
                "status": "active",
                "score": 85.5,
                "is_active": True,
                "tags": ["user", "premium"],
                "metadata": {"department": "Engineering", "level": "senior"}
            }
        }
    )
    
    name: str = Field(..., min_length=1, max_length=100, description="Name of the record")
    email: EmailStr = Field(..., description="Email address")
    age: int = Field(..., ge=0, le=150, description="Age of the person")
    status: str = Field(..., description="Status of the record")
    score: float = Field(..., ge=0.0, le=100.0, description="Score value between 0 and 100")
    is_active: bool = Field(..., description="Active status flag")
    tags: list[str] = Field(default_factory=list, description="List of tags")
    metadata: dict = Field(default_factory=dict, description="Additional metadata dictionary")


class DataModelResponse(BaseModel):
    """Response model for retrieved data."""
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )
    
    id: str = Field(..., alias="_id")
    name: str
    email: str
    age: int
    status: str
    score: float
    is_active: bool
    tags: list[str]
    metadata: dict
    created_at: datetime


class DataModelCreate(DataModel):
    """Model for creating new records (same as DataModel)."""
    pass

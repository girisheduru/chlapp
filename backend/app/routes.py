"""
API routes for data operations.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from app.database import get_database
from app.schemas import DataModelCreate, DataModelResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/api/v1", tags=["data"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return get_database()


@router.post(
    "/data",
    response_model=DataModelResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new data record",
    description="Store a new record in MongoDB with validation"
)
async def create_data(
    data: DataModelCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    POST endpoint to create and store a new record in MongoDB.
    
    - **name**: Name of the record (1-100 characters)
    - **email**: Valid email address
    - **age**: Age between 0 and 150
    - **status**: Status string
    - **score**: Score between 0.0 and 100.0
    - **is_active**: Boolean active flag
    - **tags**: List of tags
    - **metadata**: Dictionary of additional metadata
    """
    try:
        # Convert Pydantic model to dict
        data_dict = data.model_dump()
        
        # Add timestamp
        data_dict["created_at"] = datetime.now(timezone.utc)
        
        # Insert into MongoDB
        result = await db.data_collection.insert_one(data_dict)
        
        # Retrieve the inserted document
        inserted_doc = await db.data_collection.find_one({"_id": result.inserted_id})
        
        if not inserted_doc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created record"
            )
        
        # Convert ObjectId to string for response
        inserted_doc["_id"] = str(inserted_doc["_id"])
        # Ensure created_at is a datetime object (MongoDB stores it as datetime)
        if isinstance(inserted_doc.get("created_at"), str):
            inserted_doc["created_at"] = datetime.fromisoformat(inserted_doc["created_at"].replace("Z", "+00:00"))
        
        return DataModelResponse(**inserted_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating record: {str(e)}"
        )


@router.get(
    "/data",
    response_model=List[DataModelResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all data records",
    description="Retrieve all stored records from MongoDB"
)
async def get_all_data(
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    GET endpoint to retrieve all stored records.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (default: 100, max: 1000)
    """
    try:
        # Validate limit
        if limit > 1000:
            limit = 1000
        if limit < 1:
            limit = 1
        if skip < 0:
            skip = 0
        
        # Query MongoDB
        cursor = db.data_collection.find().skip(skip).limit(limit).sort("created_at", -1)
        documents = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string and create response models
        result = []
        for doc in documents:
            if doc:
                # Convert ObjectId to string
                doc["_id"] = str(doc["_id"])
                # Ensure created_at exists (for backward compatibility)
                if "created_at" not in doc:
                    doc["created_at"] = datetime.now(timezone.utc)
                result.append(DataModelResponse(**doc))
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving records: {str(e)}"
        )


@router.get(
    "/data/{record_id}",
    response_model=DataModelResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific data record by ID",
    description="Retrieve a single record by its MongoDB ObjectId"
)
async def get_data_by_id(
    record_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    GET endpoint to retrieve a specific record by ID.
    
    - **record_id**: MongoDB ObjectId of the record
    """
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(record_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid record ID format"
            )
        
        # Query MongoDB
        document = await db.data_collection.find_one({"_id": ObjectId(record_id)})
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Record with ID {record_id} not found"
            )
        
        # Convert ObjectId to string
        document["_id"] = str(document["_id"])
        # Ensure created_at exists (for backward compatibility)
        if "created_at" not in document:
            document["created_at"] = datetime.now(timezone.utc)
        
        return DataModelResponse(**document)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving record: {str(e)}"
        )

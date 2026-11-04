from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ComplaintBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    category: str
    priority: str = "Medium"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None


class ComplaintCreate(ComplaintBase):
    image_urls: Optional[List[str]] = []


class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    image_urls: Optional[List[str]] = None


class ComplaintResponse(BaseModel):
    id: int
    complaint_code: str
    user_id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    image_urls: List[str]
    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]
    department_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ComplaintWithUser(ComplaintResponse):
    user_full_name: str
    user_email: str

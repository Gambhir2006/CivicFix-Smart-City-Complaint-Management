from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationCreate(BaseModel):
    user_id: int
    complaint_id: Optional[int] = None
    message: str


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    complaint_id: Optional[int]
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

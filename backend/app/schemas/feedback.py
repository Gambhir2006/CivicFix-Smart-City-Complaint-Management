from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FeedbackCreate(BaseModel):
    complaint_id: int
    rating: int
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: int
    complaint_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AssignmentCreate(BaseModel):
    complaint_id: int
    staff_id: int


class AssignmentResponse(BaseModel):
    id: int
    complaint_id: int
    staff_id: int
    assigned_by: int
    assigned_at: datetime

    class Config:
        from_attributes = True

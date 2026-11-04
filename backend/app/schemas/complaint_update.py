from pydantic import BaseModel
from typing import Optional


class ComplaintUpdateCreate(BaseModel):
    complaint_id: int
    old_status: Optional[str] = None
    new_status: str
    remarks: Optional[str] = None
    evidence_image_url: Optional[str] = None


class ComplaintUpdateResponse(BaseModel):
    id: int
    complaint_id: int
    updated_by: int
    old_status: Optional[str]
    new_status: str
    remarks: Optional[str]
    evidence_image_url: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

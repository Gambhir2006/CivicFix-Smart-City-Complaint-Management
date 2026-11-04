from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class ComplaintUpdate(Base):
    __tablename__ = "complaint_updates"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    old_status = Column(String(30))
    new_status = Column(String(30), nullable=False)
    remarks = Column(Text)
    evidence_image_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

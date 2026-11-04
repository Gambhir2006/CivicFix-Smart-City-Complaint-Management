from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String(30), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(String(20), default="Medium")
    status = Column(String(30), default="Submitted")
    image_urls = Column(JSON, default=list)
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    address = Column(Text)
    department_id = Column(Integer, ForeignKey("departments.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="complaints")
    department = relationship("Department", backref="complaints")

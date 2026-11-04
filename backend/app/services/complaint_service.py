import random
import string
from sqlalchemy.orm import Session
from app.models import Complaint, User
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate


def generate_complaint_code() -> str:
    """Generate a unique complaint code like CF-XXXX"""
    prefix = "CF"
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{random_str}"


def create_complaint(complaint_data: ComplaintCreate, user_id: int, db: Session) -> Complaint:
    """Create a new complaint"""
    complaint_code = generate_complaint_code()

    # Ensure unique complaint code
    while db.query(Complaint).filter(Complaint.complaint_code == complaint_code).first():
        complaint_code = generate_complaint_code()

    new_complaint = Complaint(
        complaint_code=complaint_code,
        user_id=user_id,
        title=complaint_data.title,
        description=complaint_data.description,
        category=complaint_data.category,
        priority=complaint_data.priority,
        image_urls=complaint_data.image_urls or [],
        latitude=complaint_data.latitude,
        longitude=complaint_data.longitude,
        address=complaint_data.address,
        status="Submitted"
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint


def get_complaint_by_id(complaint_id: int, db: Session) -> Complaint:
    """Get a complaint by ID"""
    return db.query(Complaint).filter(Complaint.id == complaint_id).first()


def get_complaint_by_code(complaint_code: str, db: Session) -> Complaint:
    """Get a complaint by code"""
    return db.query(Complaint).filter(Complaint.complaint_code == complaint_code).first()


def get_user_complaints(user_id: int, db: Session, skip: int = 0, limit: int = 100) -> list[Complaint]:
    """Get all complaints for a specific user"""
    return db.query(Complaint).filter(Complaint.user_id == user_id).offset(skip).limit(limit).all()


def get_all_complaints(db: Session, skip: int = 0, limit: int = 100) -> list[Complaint]:
    """Get all complaints (for admin)"""
    return db.query(Complaint).offset(skip).limit(limit).all()


def update_complaint(complaint_id: int, complaint_data: ComplaintUpdate, db: Session) -> Complaint:
    """Update a complaint"""
    complaint = get_complaint_by_id(complaint_id, db)
    if not complaint:
        return None

    update_data = complaint_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(complaint, field, value)

    db.commit()
    db.refresh(complaint)
    return complaint


def delete_complaint(complaint_id: int, db: Session) -> bool:
    """Delete a complaint"""
    complaint = get_complaint_by_id(complaint_id, db)
    if not complaint:
        return False

    db.delete(complaint)
    db.commit()
    return True

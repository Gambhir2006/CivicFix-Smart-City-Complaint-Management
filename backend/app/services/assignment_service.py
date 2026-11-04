from sqlalchemy.orm import Session
from app.models import Assignment, Complaint, User
from app.schemas.assignment import AssignmentCreate


def create_assignment(assignment_data: AssignmentCreate, assigned_by: int, db: Session) -> Assignment:
    """Create a new assignment"""
    # Verify complaint exists
    complaint = db.query(Complaint).filter(Complaint.id == assignment_data.complaint_id).first()
    if not complaint:
        raise ValueError("Complaint not found")

    # Verify staff exists and is staff role
    staff = db.query(User).filter(User.id == assignment_data.staff_id, User.role == "staff").first()
    if not staff:
        raise ValueError("Staff member not found")

    # Check if already assigned
    existing = db.query(Assignment).filter(Assignment.complaint_id == assignment_data.complaint_id).first()
    if existing:
        raise ValueError("Complaint already assigned")

    new_assignment = Assignment(
        complaint_id=assignment_data.complaint_id,
        staff_id=assignment_data.staff_id,
        assigned_by=assigned_by
    )

    db.add(new_assignment)

    # Update complaint status
    complaint.status = "Assigned"

    db.commit()
    db.refresh(new_assignment)
    return new_assignment


def get_staff_assignments(staff_id: int, db: Session):
    """Get all assignments for a staff member"""
    return db.query(Assignment).filter(Assignment.staff_id == staff_id).all()


def get_complaint_assignments(complaint_id: int, db: Session):
    """Get all assignments for a complaint"""
    return db.query(Assignment).filter(Assignment.complaint_id == complaint_id).all()

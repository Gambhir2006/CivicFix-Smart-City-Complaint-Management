from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Complaint, Assignment, User
from app.schemas.complaint import ComplaintResponse
from app.routes.auth import get_token_from_header
from app.services.auth_service import decode_token

router = APIRouter(prefix="/staff", tags=["Staff"])


async def verify_staff_role(token: str = Depends(get_token_from_header)) -> int:
    """Helper to verify user is staff"""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    role = payload.get("role")
    if role != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required"
        )
    return int(payload.get("sub"))


@router.get("/tasks", response_model=List[ComplaintResponse])
def get_assigned_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    staff_id: int = Depends(verify_staff_role)
):
    """Get all complaints assigned to the current staff member"""
    # Get complaint IDs from assignments
    assignments = db.query(Assignment).filter(Assignment.staff_id == staff_id).all()
    complaint_ids = [a.complaint_id for a in assignments]

    if not complaint_ids:
        return []

    complaints = db.query(Complaint).filter(Complaint.id.in_(complaint_ids)).offset(skip).limit(limit).all()
    return complaints


@router.patch("/tasks/{complaint_id}/accept")
def accept_task(
    complaint_id: int,
    db: Session = Depends(get_db),
    staff_id: int = Depends(verify_staff_role)
):
    """Accept an assigned task"""
    # Verify assignment exists
    assignment = db.query(Assignment).filter(
        Assignment.complaint_id == complaint_id,
        Assignment.staff_id == staff_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    # Update complaint status
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    complaint.status = "In Progress"
    db.commit()

    return {"message": "Task accepted successfully"}


@router.patch("/tasks/{complaint_id}/progress")
def update_task_progress(
    complaint_id: int,
    remarks: str = None,
    db: Session = Depends(get_db),
    staff_id: int = Depends(verify_staff_role)
):
    """Update task progress"""
    # Verify assignment exists
    assignment = db.query(Assignment).filter(
        Assignment.complaint_id == complaint_id,
        Assignment.staff_id == staff_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Create a complaint update record
    from app.models import ComplaintUpdate
    status_update = ComplaintUpdate(
        complaint_id=complaint_id,
        updated_by=staff_id,
        old_status=complaint.status,
        new_status="In Progress",
        remarks=remarks
    )

    db.add(status_update)
    db.commit()

    return {"message": "Progress updated successfully"}


@router.post("/tasks/{complaint_id}/resolve")
def resolve_task(
    complaint_id: int,
    resolution_notes: str = None,
    db: Session = Depends(get_db),
    staff_id: int = Depends(verify_staff_role)
):
    """Mark a task as resolved"""
    # Verify assignment exists
    assignment = db.query(Assignment).filter(
        Assignment.complaint_id == complaint_id,
        Assignment.staff_id == staff_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Create a complaint update record
    from app.models import ComplaintUpdate
    status_update = ComplaintUpdate(
        complaint_id=complaint_id,
        updated_by=staff_id,
        old_status=complaint.status,
        new_status="Resolved",
        remarks=resolution_notes
    )

    db.add(status_update)

    # Update complaint status
    complaint.status = "Resolved"
    db.commit()

    return {"message": "Task resolved successfully"}

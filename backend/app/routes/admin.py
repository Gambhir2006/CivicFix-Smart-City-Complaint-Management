from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Complaint, ComplaintUpdate, User
from app.schemas.complaint import ComplaintUpdate as ComplaintPatch
from app.schemas.complaint_update import ComplaintUpdateCreate, ComplaintUpdateResponse
from app.schemas.assignment import AssignmentCreate, AssignmentResponse
from app.services.complaint_service import get_complaint_by_id, update_complaint
from app.services.assignment_service import create_assignment
from app.services.ai_classifier import classifier
from app.services.notification_service import notify_complaint_status_change, notify_assignment
from app.routes.auth import get_token_from_header
from app.services.auth_service import decode_token

router = APIRouter(prefix="/admin", tags=["Admin"])


async def get_current_user_id(token: str = Depends(get_token_from_header)) -> int:
    """Helper to get current user ID from token"""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return int(payload.get("sub"))


async def verify_admin_role(token: str = Depends(get_token_from_header)) -> int:
    """Helper to verify user is admin"""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    role = payload.get("role")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return int(payload.get("sub"))


@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), user_id: int = Depends(verify_admin_role)):
    """Get dashboard statistics"""
    total_complaints = db.query(Complaint).count()
    submitted = db.query(Complaint).filter(Complaint.status == "Submitted").count()
    in_progress = db.query(Complaint).filter(Complaint.status == "In Progress").count()
    resolved = db.query(Complaint).filter(Complaint.status == "Resolved").count()

    return {
        "total_complaints": total_complaints,
        "submitted": submitted,
        "in_progress": in_progress,
        "resolved": resolved,
        "pending": submitted
    }


@router.get("/complaints")
def get_all_complaints_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Get all complaints for admin"""
    complaints = db.query(Complaint).offset(skip).limit(limit).all()
    return complaints


@router.patch("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    new_status: str,
    remarks: str = None,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Update complaint status"""
    complaint = get_complaint_by_id(complaint_id, db)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    old_status = complaint.status

    # Create status update record
    status_update = ComplaintUpdate(
        complaint_id=complaint_id,
        updated_by=user_id,
        old_status=old_status,
        new_status=new_status,
        remarks=remarks
    )

    db.add(status_update)

    # Update complaint status
    update_data = ComplaintPatch(status=new_status)
    update_complaint(complaint_id, update_data, db)

    # Notify the complaint owner
    notify_complaint_status_change(complaint_id, old_status, new_status, db)

    db.commit()

    return {
        "message": "Status updated successfully",
        "old_status": old_status,
        "new_status": new_status
    }


@router.get("/complaints/{complaint_id}/history")
def get_complaint_history(
    complaint_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Get complaint status history"""
    complaint = get_complaint_by_id(complaint_id, db)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    history = db.query(ComplaintUpdate).filter(
        ComplaintUpdate.complaint_id == complaint_id
    ).order_by(ComplaintUpdate.created_at).all()

    return history


@router.post("/assign", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_complaint(
    assignment_data: AssignmentCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Assign a complaint to a staff member"""
    try:
        assignment = create_assignment(assignment_data, user_id, db)
        # Notify the staff member about the assignment
        notify_assignment(assignment_data.complaint_id, assignment_data.staff_id, db)
        return assignment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/staff")
def get_all_staff(
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Get all staff members"""
    staff = db.query(User).filter(User.role == "staff").all()
    return staff


@router.post("/classify")
def classify_complaint(
    title: str,
    description: str,
    user_id: int = Depends(verify_admin_role)
):
    """AI-powered complaint classification"""
    result = classifier.classify(title, description)
    return result


@router.post("/detect-duplicates")
def detect_duplicates(
    title: str,
    description: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Detect potential duplicate complaints"""
    existing = db.query(Complaint).all()
    existing_data = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "complaint_code": c.complaint_code
        }
        for c in existing
    ]

    new_complaint = {"title": title, "description": description}
    duplicates = classifier.detect_duplicates(new_complaint, existing_data)

    return {
        "duplicates": duplicates,
        "count": len(duplicates)
    }

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Feedback, Complaint
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.routes.auth import get_token_from_header
from app.services.auth_service import decode_token

router = APIRouter(prefix="/feedback", tags=["Feedback"])


async def get_current_user_id(token: str = Depends(get_token_from_header)) -> int:
    """Helper to get current user ID from token"""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return int(payload.get("sub"))


@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create feedback for a resolved complaint"""
    # Verify complaint exists and is resolved
    complaint = db.query(Complaint).filter(Complaint.id == feedback_data.complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    if complaint.status != "Resolved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only provide feedback for resolved complaints"
        )

    # Verify user owns the complaint
    if complaint.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to provide feedback for this complaint"
        )

    # Check if feedback already exists
    existing = db.query(Feedback).filter(
        Feedback.complaint_id == feedback_data.complaint_id,
        Feedback.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback already provided for this complaint"
        )

    # Validate rating
    if feedback_data.rating < 1 or feedback_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    new_feedback = Feedback(
        complaint_id=feedback_data.complaint_id,
        user_id=user_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback


@router.get("/complaint/{complaint_id}")
def get_complaint_feedback(
    complaint_id: int,
    db: Session = Depends(get_db)
):
    """Get feedback for a specific complaint"""
    feedback = db.query(Feedback).filter(Feedback.complaint_id == complaint_id).all()
    return feedback

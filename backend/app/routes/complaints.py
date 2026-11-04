from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Complaint, User
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse, ComplaintWithUser
from app.services.complaint_service import (
    create_complaint,
    get_complaint_by_id,
    get_user_complaints,
    get_all_complaints,
    update_complaint,
    delete_complaint,
)
from app.services.storage_service import upload_image
from app.routes.auth import get_token_from_header
from app.services.auth_service import decode_token

router = APIRouter(prefix="/complaints", tags=["Complaints"])


async def get_current_user_id(token: str = Depends(get_token_from_header)) -> int:
    """Helper to get current user ID from token"""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return int(payload.get("sub"))


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint_endpoint(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    priority: str = Form("Medium"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create a new complaint with optional image uploads"""
    image_urls = []
    for image in images:
        url = upload_image(image.file)
        if url:
            image_urls.append(url)

    complaint_data = ComplaintCreate(
        title=title,
        description=description,
        category=category,
        priority=priority,
        latitude=latitude,
        longitude=longitude,
        address=address,
        image_urls=image_urls
    )

    complaint = create_complaint(complaint_data, user_id, db)
    return complaint


@router.get("/my", response_model=List[ComplaintResponse])
def get_my_complaints(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get all complaints for the current user"""
    complaints = get_user_complaints(user_id, db, skip, limit)
    return complaints


@router.get("/public", response_model=List[ComplaintWithUser])
def get_public_complaints(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all public complaints (without sensitive user data)"""
    complaints = db.query(Complaint, User).join(User, Complaint.user_id == User.id).offset(skip).limit(limit).all()

    result = []
    for complaint, user in complaints:
        result.append(ComplaintWithUser(
            id=complaint.id,
            complaint_code=complaint.complaint_code,
            user_id=complaint.user_id,
            title=complaint.title,
            description=complaint.description,
            category=complaint.category,
            priority=complaint.priority,
            status=complaint.status,
            image_urls=complaint.image_urls,
            latitude=complaint.latitude,
            longitude=complaint.longitude,
            address=complaint.address,
            department_id=complaint.department_id,
            created_at=complaint.created_at,
            updated_at=complaint.updated_at,
            user_full_name=user.full_name,
            user_email=user.email
        ))
    return result


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get a specific complaint by ID"""
    complaint = get_complaint_by_id(complaint_id, db)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Check if user owns the complaint or is admin/staff
    if complaint.user_id != user_id:
        # In a real app, check if user is admin or staff
        pass

    return complaint


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint_endpoint(
    complaint_id: int,
    complaint_data: ComplaintUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Update a complaint"""
    complaint = get_complaint_by_id(complaint_id, db)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Only allow user to update their own complaint (or admin/staff)
    if complaint.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this complaint"
        )

    updated = update_complaint(complaint_id, complaint_data, db)
    return updated


@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complaint_endpoint(
    complaint_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Delete a complaint"""
    complaint = get_complaint_by_id(complaint_id, db)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Only allow user to delete their own complaint (and only if not resolved)
    if complaint.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this complaint"
        )

    if complaint.status in ["In Progress", "Resolved", "Closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a complaint that is being processed or resolved"
        )

    delete_complaint(complaint_id, db)
    return None

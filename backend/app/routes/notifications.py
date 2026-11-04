from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Notification
from app.schemas.notification import NotificationResponse
from app.services.notification_service import (
    get_user_notifications,
    mark_as_read,
    mark_all_as_read
)
from app.routes.auth import get_token_from_header
from app.services.auth_service import decode_token

router = APIRouter(prefix="/notifications", tags=["Notifications"])


async def get_current_user_id(token: str = Depends(get_token_from_header)) -> int:
    """Helper to get current user ID from token"""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return int(payload.get("sub"))


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get notifications for the current user"""
    notifications = get_user_notifications(user_id, db, unread_only)
    return notifications


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Mark a notification as read"""
    success = mark_as_read(notification_id, user_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return {"message": "Notification marked as read"}


@router.patch("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Mark all notifications as read"""
    mark_all_as_read(user_id, db)
    return {"message": "All notifications marked as read"}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get count of unread notifications"""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}

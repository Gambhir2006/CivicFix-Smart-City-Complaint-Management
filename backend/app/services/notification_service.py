from sqlalchemy.orm import Session
from app.models import Notification, Complaint


def create_notification(user_id: int, message: str, complaint_id: int = None, db: Session = None) -> Notification:
    """Create a new notification"""
    notification = Notification(
        user_id=user_id,
        complaint_id=complaint_id,
        message=message,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_user_notifications(user_id: int, db: Session, unread_only: bool = False):
    """Get notifications for a user"""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()


def mark_as_read(notification_id: int, user_id: int, db: Session) -> bool:
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notification:
        return False
    notification.is_read = True
    db.commit()
    return True


def mark_all_as_read(user_id: int, db: Session):
    """Mark all notifications as read for a user"""
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()


def notify_complaint_status_change(complaint_id: int, old_status: str, new_status: str, db: Session):
    """Notify the complaint owner about status change"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        return

    message = f"Your complaint '{complaint.title}' status changed from {old_status} to {new_status}"
    create_notification(complaint.user_id, message, complaint_id, db)


def notify_assignment(complaint_id: int, staff_id: int, db: Session):
    """Notify staff about new assignment"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        return

    message = f"You have been assigned to complaint: {complaint.title}"
    create_notification(staff_id, message, complaint_id, db)

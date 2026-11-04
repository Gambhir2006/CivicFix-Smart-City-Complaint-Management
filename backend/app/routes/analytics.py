from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Complaint
from app.routes.auth import get_token_from_header
from app.services.auth_service import decode_token

router = APIRouter(prefix="/analytics", tags=["Analytics"])


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


@router.get("/public")
def get_public_analytics(db: Session = Depends(get_db)):
    """Get public analytics (no auth required)"""
    total = db.query(Complaint).count()
    resolved = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    in_progress = db.query(Complaint).filter(Complaint.status == "In Progress").count()

    # Category breakdown
    category_stats = db.query(
        Complaint.category,
        func.count(Complaint.id)
    ).group_by(Complaint.category).all()

    categories = {cat: count for cat, count in category_stats}

    return {
        "total_complaints": total,
        "resolved": resolved,
        "in_progress": in_progress,
        "resolution_rate": round((resolved / total * 100) if total > 0 else 0, 2),
        "categories": categories
    }


@router.get("/detailed")
def get_detailed_analytics(db: Session = Depends(get_db), user_id: int = Depends(verify_admin_role)):
    """Get detailed analytics for admin"""
    # Status breakdown
    status_stats = db.query(
        Complaint.status,
        func.count(Complaint.id)
    ).group_by(Complaint.status).all()

    status_breakdown = {status: count for status, count in status_stats}

    # Category breakdown
    category_stats = db.query(
        Complaint.category,
        func.count(Complaint.id)
    ).group_by(Complaint.category).all()

    category_breakdown = {cat: count for cat, count in category_stats}

    # Priority breakdown
    priority_stats = db.query(
        Complaint.priority,
        func.count(Complaint.id)
    ).group_by(Complaint.priority).all()

    priority_breakdown = {prio: count for prio, count in priority_stats}

    # Monthly trends (last 6 months)
    from sqlalchemy import extract
    monthly_stats = db.query(
        extract('year', Complaint.created_at).label('year'),
        extract('month', Complaint.created_at).label('month'),
        func.count(Complaint.id)
    ).group_by(
        extract('year', Complaint.created_at),
        extract('month', Complaint.created_at)
    ).order_by(
        extract('year', Complaint.created_at),
        extract('month', Complaint.created_at)
    ).limit(6).all()

    monthly_trends = [
        {"year": int(year), "month": int(month), "count": count}
        for year, month, count in monthly_stats
    ]

    return {
        "status_breakdown": status_breakdown,
        "category_breakdown": category_breakdown,
        "priority_breakdown": priority_breakdown,
        "monthly_trends": monthly_trends
    }

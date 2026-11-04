from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.routes.auth import get_token_from_header
from app.services.auth_service import decode_token

router = APIRouter(prefix="/departments", tags=["Departments"])


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


@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Create a new department"""
    existing = db.query(Department).filter(Department.name == department_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this name already exists"
        )

    new_department = Department(
        name=department_data.name,
        description=department_data.description
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return new_department


@router.get("/", response_model=List[DepartmentResponse])
def get_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all departments"""
    departments = db.query(Department).filter(Department.is_active == True).offset(skip).limit(limit).all()
    return departments


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific department"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    return department


@router.patch("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Update a department"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    update_data = department_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(department, field, value)

    db.commit()
    db.refresh(department)
    return department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_admin_role)
):
    """Delete a department (soft delete by setting is_active to False)"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    department.is_active = False
    db.commit()
    return None

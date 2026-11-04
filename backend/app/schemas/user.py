from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    role: str = "citizen"


class UserCreate(UserBase):
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

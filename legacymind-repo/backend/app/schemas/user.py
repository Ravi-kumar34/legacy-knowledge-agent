from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models.user import UserRole

# Shared properties across schemas
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: UserRole = UserRole.PATIENT

# Creation Schema (Input validation during registration)
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

# Database/Response Schema (What is returned to the user safely)
class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic V2 replacement for orm_mode = True
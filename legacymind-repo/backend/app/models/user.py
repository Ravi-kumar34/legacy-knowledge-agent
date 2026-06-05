import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime
from app.services.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RESPONDER = "responder"
    PATIENT = "patient"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PATIENT, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
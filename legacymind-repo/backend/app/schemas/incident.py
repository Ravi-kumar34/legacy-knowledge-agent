from pydantic import BaseModel, Field
from datetime import datetime
from app.models.incident import IncidentSeverity

class IncidentBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=10)
    severity: IncidentSeverity = IncidentSeverity.MEDIUM

class IncidentCreate(IncidentBase):
    pass

class IncidentOut(IncidentBase):
    id: int
    reported_by: int
    created_at: datetime

    class Config:
        from_attributes = True
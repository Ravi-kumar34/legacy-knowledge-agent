from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.schemas.incident import IncidentCreate, IncidentOut
from app.models.incident import Incident
from app.models.user import User, UserRole
from app.api.dependencies import get_current_user, RoleChecker

router = APIRouter()

# Any authenticated user can report an emergency incident
@router.post("/", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: IncidentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_incident = Incident(
        title=incident_in.title,
        description=incident_in.description,
        severity=incident_in.severity,
        reported_by=current_user.id
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return new_incident

# Only Responders and Admins can view the master incident list
@router.get("/", response_model=list[IncidentOut])
def get_all_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.RESPONDER, UserRole.ADMIN]))
):
    incidents = db.query(Incident).all()
    return incidents
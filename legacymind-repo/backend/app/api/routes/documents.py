import os
import shutil
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentOut
from app.api.dependencies import get_current_user

router = APIRouter()

# Setup local storage directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions for medical documents/IDs
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Generate a secure, unique filename to prevent overwriting
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 3. Save the file to disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save file to disk."
        )

    # 4. Save record to MySQL database
    new_document = Document(
        filename=file.filename, # Keep original name for UI display
        file_path=file_path,    # Internal secure path
        uploaded_by=current_user.id
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return new_document


@router.get("/", response_model=list[DocumentOut])
def get_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only retrieve their own documents
    docs = db.query(Document).filter(Document.uploaded_by == current_user.id).all()
    return docs
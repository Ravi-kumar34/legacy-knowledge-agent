from pydantic import BaseModel
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    filename: str
    file_path: str
    uploaded_by: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
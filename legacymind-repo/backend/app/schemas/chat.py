from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ChatMessage(BaseModel):
    role: str = Field(..., description="Either 'user' or 'agent'")
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSessionRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    session_id: Optional[str] = None
    
class ChatSessionResponse(BaseModel):
    session_id: str
    messages: list[ChatMessage]
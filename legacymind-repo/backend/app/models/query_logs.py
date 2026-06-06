import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.services.database import Base

class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    tools_used = Column(String(255), nullable=True) 
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable in case the frontend user isn't logged in
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Optional relationship back to the user
    user = relationship("User")
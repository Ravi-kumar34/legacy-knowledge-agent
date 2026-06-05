import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LegacyMind AI"
    ENVIRONMENT: str
    
    # Database
    DATABASE_URL: str 
    
    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # API Keys (Added to allow Pydantic validation)
    HINDSIGHT_API_KEY: str
    ANTIGRAVITY_API_KEY: str

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
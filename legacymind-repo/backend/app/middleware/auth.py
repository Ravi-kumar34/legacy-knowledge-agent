from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from app.core.config import settings

class AuthStateMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Default state
        request.state.user_email = "anonymous"
        
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                request.state.user_email = payload.get("sub", "anonymous")
            except jwt.PyJWTError:
                pass # Ignore invalid tokens here; let the route Dependencies throw the actual 401 error
                
        return await call_next(request)
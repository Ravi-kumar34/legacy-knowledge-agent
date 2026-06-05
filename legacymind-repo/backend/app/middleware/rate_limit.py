import time
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.request_counts = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()
        
        if client_ip not in self.request_counts:
            self.request_counts[client_ip] = []
            
        # Clear requests older than 60 seconds
        self.request_counts[client_ip] = [
            t for t in self.request_counts[client_ip] 
            if current_time - t < 60
        ]
        
        if len(self.request_counts[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please slow down."}
            )
            
        self.request_counts[client_ip].append(current_time)
        return await call_next(request)
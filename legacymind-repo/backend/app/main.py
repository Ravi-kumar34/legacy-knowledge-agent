import os
import time
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware

# Custom Routers
from app.api.routes import auth, incidents, documents, health, ingestion, query

# Custom Middleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.auth import AuthStateMiddleware

# 1. Setup Structured Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
)
logger = logging.getLogger("legacymind-backend")

# 2. Initialize the app FIRST
app = FastAPI(
    title="LegacyMind AI - Emergency Assistance Platform API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None
)

# 3. THEN attach the Custom Middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(AuthStateMiddleware)

# 4. CORS Protection Middleware
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# 5. Global Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Duration: {duration:.4f}s")
    return response

# 6. Connect Routers
app.include_router(health.router, prefix="/api/v1/health", tags=["Health Check"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incidents"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Document Management"])
app.include_router(ingestion.router, prefix="/api/v1/ingestion", tags=["Ingestion"])
app.include_router(query.router, prefix="/api/v1/query", tags=["Query"])
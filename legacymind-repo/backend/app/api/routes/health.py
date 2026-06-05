from fastapi import APIRouter, status

router = APIRouter()

@router.get("/", status_code=status.HTTP_200_OK)
def health_check():
    """
    Used by hosting platforms to verify the server is running.
    """
    return {
        "status": "healthy",
        "service": "legacymind-backend",
        "version": "1.0.0"
    }
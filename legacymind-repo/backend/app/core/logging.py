import logging
import sys

def setup_logger():
    logger = logging.getLogger("legacymind-backend")
    logger.setLevel(logging.INFO)
    
    # Structured logging formatted as JSON for easy parsing in production
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}')
    handler.setFormatter(formatter)
    
    if not logger.handlers:
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()
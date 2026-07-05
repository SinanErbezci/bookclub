import logging 
from corsheaders.signals import check_request_enabled


logger = logging.getLogger(__name__)
print(">>> cors.py imported")

def cors_allow_health(sender, request, **kwargs):
    logger.info("CORS signal called for %s", request.path)
    return request.path.rstrip("/") == "/health"


check_request_enabled.connect(cors_allow_health)
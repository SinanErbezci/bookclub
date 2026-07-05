from corsheaders.signals import check_request_enabled
print(">>> cors.py imported")

def cors_allow_health(sender, request, **kwargs):
    print(">>> signal:", request.path)
    return request.path.rstrip("/") == "/health"


check_request_enabled.connect(cors_allow_health)
from corsheaders.signals import check_request_enabled


def cors_allow_health(sender, request, **kwargs):
    return request.path.rstrip("/") == "/health"


check_request_enabled.connect(cors_allow_health)
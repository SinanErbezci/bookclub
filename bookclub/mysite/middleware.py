from django.db import connection
from django.http import JsonResponse


class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/health/live/":
            return JsonResponse({"status": "ok"})

        if request.path == "/health/ready/":
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")

                return JsonResponse({"status": "ready"})

            except Exception:
                return JsonResponse(
                    {"status": "not ready"},
                    status=503,
                )

        return self.get_response(request)
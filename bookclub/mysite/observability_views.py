import time

from django.http import HttpResponse


def test_500(request):
    return HttpResponse(
        "Intentional 500 response for observability testing.",
        status=500,
    )

def test_slow(request):
    time.sleep(3)

    return HttpResponse(
        "Intentional slow response for observability testing.",
        status=200,
    )
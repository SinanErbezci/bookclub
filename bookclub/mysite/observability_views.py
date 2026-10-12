from django.http import HttpResponse


def test_500(request):
    return HttpResponse(
        "Intentional 500 response for observability testing.",
        status=500,
    )
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Book
from .serializers import BookSerializer


class SearchBooksAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response([])

        books = (
            Book.objects
            .filter(title__icontains=query)
            .order_by("title")[:10]
        )

        serializer = BookSerializer(books, many=True)

        return Response(serializer.data)
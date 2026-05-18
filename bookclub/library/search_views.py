from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVector
)
from django.db.models import F
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
            .annotate(
                search=(
                    SearchVector("title", weight="A") +
                    SearchVector("author__name", weight="B")
                )
            )
            .annotate(
                rank=SearchRank(
                    F("search"),
                    SearchQuery(
                        query,
                        search_type="websearch"
                    )
                )
            )
            .filter(rank__gte=0.1)
            .order_by("-rank")[:10]
        )

        serializer = BookSerializer(books, many=True)

        return Response(serializer.data)
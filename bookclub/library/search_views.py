from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVector,
    TrigramSimilarity
)
from django.db.models import F, Q
from .models import Book, Author, Genre
from .serializers import SearchBookSerializer, SearchAuthorSerializer, SearchGenreSerializer
from .pagination import SearchPagination


class SearchBooksAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response({
                "books": [],
                "authors": [],
                "genres": [],
            })

        # Books
        books = (
            Book.objects
            .annotate(
                search=(
                    SearchVector(
                        "title",
                        weight="A"
                    ) +
                    SearchVector(
                        "author__name",
                        weight="B"
                    )
                )
            )
            .annotate(
                rank=SearchRank(
                    F("search"),
                    SearchQuery(
                        query,
                        search_type="websearch"
                    )
                ),

                similarity=(
                    TrigramSimilarity(
                        "title",
                        query
                    ) +
                    TrigramSimilarity(
                        "author__name",
                        query
                    )
                )
            )
            .annotate(
                score=(
                    F("rank") * 0.85 +
                    F("similarity") * 0.15
                )
            )
            .filter(
                Q(rank__gte=0.05) |
                Q(similarity__gt=0.3)
            )
            .order_by("-score")
        )

        # Authors
        authors = (
            Author.objects
            .filter(name__icontains=query)
            .order_by("name")[:5]
        )

        # genres
        genres = (
            Genre.objects
            .filter(name__icontains=query)
            .order_by("name")[:5]
        )

        paginator = SearchPagination()
        paginated_books = paginator.paginate_queryset(books, request)

        return Response({
            "books": SearchBookSerializer(paginated_books,many=True).data,
            "books_count": books.count(),
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            "authors": SearchAuthorSerializer(authors,many=True).data,
            "genres": SearchGenreSerializer(genres,many=True).data,
        })
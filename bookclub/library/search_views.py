from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVector,
    TrigramSimilarity,
)

from django.db.models import F, Q, Value, Case, When, FloatField
from django.db.models.functions import Ln

from .models import Book, Author, Genre

from .serializers import (
    SearchBookSerializer,
    SearchAuthorSerializer,
    SearchGenreSerializer,
)

from .pagination import SearchPagination


class SearchBooksAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        mode = request.query_params.get("mode", "full")

        is_dropdown = mode == "dropdown"

        if not query:
            return Response(
                {
                    "books": [],
                    "authors": [],
                    "genres": [],
                }
            )

        similarity_threshold = 0.25 if is_dropdown else 0.35

        # BOOKS
        books = (
            Book.objects.annotate(
                search=(
                    SearchVector("title", weight="A")
                    + SearchVector("author__name", weight="B")
                )
            )
            .annotate(
                rank=SearchRank(
                    F("search"),
                    SearchQuery(query, search_type="websearch"),
                ),
                similarity=(
                    TrigramSimilarity("title", query) * 2.0
                    + TrigramSimilarity("author__name", query) * 0.5
                ),
                prefix_score=Case(
                    When(
                        title__istartswith=query,
                        then=Value(2.0),
                    ),
                    When(
                        author__name__istartswith=query,
                        then=Value(1.0),
                    ),
                    default=Value(0.0),
                    output_field=FloatField(),
                ),
                popularity_score=Ln(F("num_ratings") + 1),
            )
            .annotate(
                score=(
                    F("prefix_score") * 0.5
                    + F("rank") * 0.3
                    + F("similarity") * 0.15
                    + F("popularity_score") * 0.05
                )
            )
            .filter(
                Q(title__istartswith=query)
                | Q(author__name__istartswith=query)
                | Q(rank__gte=0.05)
                | Q(similarity__gt=similarity_threshold)
            )
            .order_by("-score")
        )

        # AUTHORS
        authors = Author.objects.filter(name__icontains=query).order_by("name")[:5]

        # GENRES
        genres = Genre.objects.filter(name__icontains=query).order_by("name")[:5]

        # DROPDOWN MODE
        if is_dropdown:
            books = books[:5]

            return Response(
                {
                    "books": SearchBookSerializer(books, many=True).data,
                    "authors": SearchAuthorSerializer(authors, many=True).data,
                    "genres": SearchGenreSerializer(genres, many=True).data,
                }
            )

        # FULL SEARCH MODE
        paginator = SearchPagination()

        paginated_books = paginator.paginate_queryset(books, request)

        return Response(
            {
                "books": SearchBookSerializer(paginated_books, many=True).data,
                "books_count": books.count(),
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "authors": SearchAuthorSerializer(authors, many=True).data,
                "genres": SearchGenreSerializer(genres, many=True).data,
            }
        )

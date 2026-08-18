from django.core.management.base import BaseCommand
from django.db.models.functions import Length

from library.models import Book


class Command(BaseCommand):
    help = "Display candidate books for the summarization benchmark."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=5,
            help="Number of books to display per category.",
        )

    def print_books(self, title, books):
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(title))
        self.stdout.write(
            f"{'ID':<8}"
            f"{'Rating':<8}"
            f"{'Ratings':<10}"
            f"{'Chars':<8}"
            f"{'Series':<25}"
            f"Title"
        )
        self.stdout.write("-" * 130)

        for book in books:
            series = book.series.name if book.series else "-"

            self.stdout.write(
                f"{book.id:<8}"
                f"{book.rating:<8}"
                f"{book.num_ratings:<10}"
                f"{book.description_length:<8}"
                f"{series:<25.25}"
                f"{book.title}"
            )

    def handle(self, *args, **options):
        limit = options["limit"]

        books = (
            Book.objects
            .select_related("series")
            .annotate(description_length=Length("description"))
            .filter(description_length__gte=100)
        )

        self.print_books(
            "Most Popular",
            books.order_by("-num_ratings")[:limit],
        )

        self.print_books(
            "Fantasy",
            books.filter(genres__name="Fantasy")
                 .order_by("-num_ratings")[:limit],
        )

        self.print_books(
            "Science Fiction",
            books.filter(genres__name="Science Fiction")
                 .order_by("-num_ratings")[:limit],
        )

        self.print_books(
            "Romance",
            books.filter(genres__name="Romance")
                 .order_by("-num_ratings")[:limit],
        )

        self.print_books(
            "Childrens",
            books.filter(genres__name="Childrens")
                 .order_by("-num_ratings")[:limit],
        )

        self.print_books(
            "Shortest Meaningful Descriptions",
            books.order_by("description_length")[:limit],
        )

        self.print_books(
            "Longest Descriptions",
            books.order_by("-description_length")[:limit],
        )
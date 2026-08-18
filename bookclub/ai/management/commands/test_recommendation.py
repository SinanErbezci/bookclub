from django.core.management.base import BaseCommand

from ai.services.recommendations import RecommendationService
from library.models import Book


class Command(BaseCommand):
    help = "Test book recommendations."

    def add_arguments(self, parser):
        parser.add_argument(
            "title",
            type=str,
            help="Book title.",
        )

    def handle(self, *args, **options):
        title = options["title"]

        book = Book.objects.filter(
            title__iexact=title,
        ).first()

        if book is None:
            self.stdout.write(
                self.style.ERROR("Book not found.")
            )
            return

        service = RecommendationService()

        recommendations = service.recommend(
            book,
            limit=30,
        )

        self.stdout.write("")
        self.stdout.write("=" * 100)
        self.stdout.write(f"Recommendations for: {book.title}")
        self.stdout.write("=" * 100)

        # self.stdout.write(
        #     f"{'Title':50}"
        #     f"{'Similarity':>12}"
        #     f"{'Score':>10}"
        # )

        # self.stdout.write("-" * 100)

        # for candidate in recommendations:
        #     self.stdout.write(
        #         f"{candidate.title[:50]:50}"
        #         f"{candidate.similarity:12.3f}"
        #         f"{candidate.score:10.3f}"
        #     )
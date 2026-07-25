from django.core.management.base import BaseCommand

from library.ai.explanations import ExplanationService
from library.models import Book


class Command(BaseCommand):
    help = "Test AI recommendation explanations."

    def handle(self, *args, **options):
        source_book = Book.objects.first()

        if source_book is None:
            self.stderr.write(self.style.ERROR("No books found."))
            return

        recommended_book = (
            Book.objects
            .exclude(pk=source_book.pk)
            .first()
        )

        if recommended_book is None:
            self.stderr.write(
                self.style.ERROR(
                    "At least two books are required."
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f"Source Book: {source_book.title}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Recommended Book: {recommended_book.title}"
            )
        )

        self.stdout.write("-" * 80)

        service = ExplanationService()

        explanation = service.explain_book_recommendation(
            source_book,
            recommended_book,
        )

        self.stdout.write("Explanation:\n")
        self.stdout.write(explanation)
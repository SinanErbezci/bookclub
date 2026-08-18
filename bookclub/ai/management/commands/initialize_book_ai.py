from django.core.management.base import BaseCommand

from ai.models import BookAI
from library.models import Book


class Command(BaseCommand):
    help = "Initialize BookAI records for books that don't have one."

    BATCH_SIZE = 1000

    def handle(self, *args, **options):
        self.stdout.write("Initializing BookAI records...")

        missing_books = Book.objects.filter(ai__isnull=True)
        total = missing_books.count()

        self.stdout.write(f"Found {total} books without BookAI records.")

        batch = []
        created = 0

        for book in missing_books.iterator(chunk_size=self.BATCH_SIZE):
            batch.append(BookAI(book=book))

            if len(batch) == self.BATCH_SIZE:
                BookAI.objects.bulk_create(batch)
                created += len(batch)

                self.stdout.write(f"Created {created}/{total} records...")

                batch.clear()

        if batch:
            BookAI.objects.bulk_create(batch)
            created += len(batch)

        self.stdout.write(
            self.style.SUCCESS(f"Done! Created {created}/{total} BookAI records.")
        )

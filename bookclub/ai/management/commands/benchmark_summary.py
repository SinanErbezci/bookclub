import random
import time
from statistics import mean

from django.core.management.base import BaseCommand

from ai.services.providers.ollama import OllamaSummaryProvider
from ai.services.summary import SummaryService
from library.models import Book


class Command(BaseCommand):
    help = "Benchmark AI summary generation performance."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=10,
            help="Number of random books to benchmark.",
        )

    def handle(self, *args, **options):
        count = options["count"]

        service = SummaryService(
            provider=OllamaSummaryProvider(),
        )

        books = list(
            Book.objects.exclude(description__isnull=True)
            .exclude(description__exact="")
            .select_related("author")
            .prefetch_related("genres")
        )

        if not books:
            self.stdout.write(
                self.style.ERROR("No books with descriptions found.")
            )
            return

        sample_size = min(count, len(books))
        sample = random.sample(books, sample_size)

        times = []

        self.stdout.write("")
        self.stdout.write(f"Benchmarking {sample_size} books...")
        self.stdout.write("")

        for index, book in enumerate(sample, start=1):
            start = time.perf_counter()

            summary = service.generate(
                title=book.title,
                author=book.author.name,
                genres=[genre.name for genre in book.genres.all()],
                description=book.description,
            )

            elapsed = time.perf_counter() - start
            times.append(elapsed)

            self.stdout.write(
                f"[{index}/{sample_size}] "
                f"{book.title} "
                f"({elapsed:.2f}s, {len(summary)} chars)"
            )

        average = mean(times)

        estimated_seconds = average * 52000
        estimated_hours = estimated_seconds / 3600
        estimated_days = estimated_hours / 24

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Benchmark complete"))
        self.stdout.write(f"Average: {average:.2f} seconds/book")
        self.stdout.write(f"Fastest: {min(times):.2f} seconds")
        self.stdout.write(f"Slowest: {max(times):.2f} seconds")
        self.stdout.write("")
        self.stdout.write("Estimated full run (52,000 books):")
        self.stdout.write(f"Hours: {estimated_hours:.1f}")
        self.stdout.write(f"Days : {estimated_days:.1f}")
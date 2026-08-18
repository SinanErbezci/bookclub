from pathlib import Path
import json

import time
from statistics import mean
from datetime import datetime, UTC

from django.core.management.base import (
    BaseCommand,
    CommandError,
)

from ai.services.summary.summary import SummaryService
from ai.services.summary.providers.ollama import OllamaSummaryProvider
from ai.services.summary.providers.openai import OpenAISummaryProvider

from library.models import Book


class Command(BaseCommand):
    help = "Benchmark summary generation using a fixed benchmark dataset."

    def add_arguments(self, parser):
        parser.add_argument(
            "--provider",
            choices=["ollama", "openai"],
            required=True,
            help="Summary provider to benchmark.",
        )

    def handle(self, *args, **options):
        benchmark = self._load_benchmark()

        benchmark_books = self._load_books(benchmark)

        provider = self._create_provider(
            options["provider"],
        )

        service = SummaryService(provider)

        results = self._run_benchmark(
            benchmark_books,
            service,
        )

        self._save_results(
            results,
            provider,
        )

    def _load_benchmark(self):
        benchmark_path = (
            Path(__file__).resolve().parents[2]
            / "benchmark"
            / "summary"
            / "benchmark_books.json"
        )

        with benchmark_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def _load_books(self, benchmark):
        ids = [entry["id"] for entry in benchmark]

        books = (
            Book.objects.filter(id__in=ids)
            .select_related("author")
            .prefetch_related("genres")
        )

        books_by_id = {book.id: book for book in books}

        benchmark_books = []

        for entry in benchmark:
            book = books_by_id.get(entry["id"])

            if book is None:
                raise CommandError(f"Benchmark book {entry['id']} not found.")

            benchmark_books.append((entry, book))

        return benchmark_books

    def _create_provider(self, provider_name):
        match provider_name:
            case "ollama":
                return OllamaSummaryProvider()
            case "openai":
                return OpenAISummaryProvider()

            case _:
                raise CommandError(f"Unknown Provider: {provider_name}")

    def _run_benchmark(self, benchmark_books, service):
        results = []
        total_books = len(benchmark_books)

        self.stdout.write("")
        self.stdout.write(f"Benchmarking {total_books} books...")
        self.stdout.write("")

        for index, (benchmark, book) in enumerate(
            benchmark_books,
            start=1,
        ):
            start = time.perf_counter()

            result = service.generate(
                title=book.title,
                author=book.author.name,
                genres=[genre.name for genre in book.genres.all()],
                description=book.description,
            )

            elapsed = time.perf_counter() - start

            self.stdout.write(
                f"[{index}/{total_books}] " f"{book.title} " f"({elapsed:.2f}s)"
            )

            results.append(
                {
                    "id": benchmark["id"],
                    "title": benchmark["title"],
                    "categories": benchmark["categories"],
                    "duration": elapsed,
                    "summary": result.summary,
                    "prompt_tokens": result.prompt_tokens,
                    "completion_tokens": result.completion_tokens,
                    "total_tokens": result.total_tokens,
                }
            )

        self.stdout.write("")
        return results

    def _save_results(self, results, provider):
        durations = [result["duration"] for result in results]

        prompt_tokens = [
            result["prompt_tokens"]
            for result in results
            if result["prompt_tokens"] is not None
        ]

        completion_tokens = [
            result["completion_tokens"]
            for result in results
            if result["completion_tokens"] is not None
        ]

        total_tokens = [
            result["total_tokens"]
            for result in results
            if result["total_tokens"] is not None
        ]

        created_at = datetime.now(UTC)

        output = {
            "provider": provider.name,
            "model": provider.model,
            "created_at": created_at.isoformat(),
            "book_count": len(results),
            "average_duration": mean(durations),
            "fastest_duration": min(durations),
            "slowest_duration": max(durations),
            "total_prompt_tokens": sum(prompt_tokens),
            "total_completion_tokens": sum(completion_tokens),
            "total_tokens": sum(total_tokens),
            "average_prompt_tokens": (mean(prompt_tokens) if prompt_tokens else None),
            "average_completion_tokens": (
                mean(completion_tokens) if completion_tokens else None
            ),
            "average_total_tokens": (mean(total_tokens) if total_tokens else None),
            "books": results,
        }

        timestamp = created_at.strftime("%Y%m%d_%H%M%S")

        filename = (
            f"{provider.name}_" f"{provider.model.replace(':', '_')}_" f"{timestamp}"
        )

        output_path = (
            Path(__file__).resolve().parents[2]
            / "benchmark"
            / "summary"
            / "results"
            / f"{filename}.json"
        )

        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w", encoding="utf-8") as file:
            json.dump(
                output,
                file,
                indent=4,
                ensure_ascii=False,
            )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"Benchmark results saved to {output_path}")
        )

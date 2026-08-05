from pathlib import Path
import json
from datetime import datetime

from django.core.management.base import BaseCommand

from library.models import Book

from ai.services.summary.batch import SummaryBatchService
from ai.services.summary.providers.openai import DEFAULT_MODEL
from ai.prompts.summary_v2 import PROMPT_VERSION
from ai.services.summary.token_estimator import SummaryTokenEstimator

MAX_REQUESTS = 50_000
MAX_ENQUEUED_TOKENS = 1_500_000


class Command(BaseCommand):
    help = "Export books as an OpenAI Batch API JSONL file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            help="Limit the number of books to export.",
        )

    def handle(self, *args, **options):
        limit = options.get("limit")

        books = (
            Book.objects.select_related("author")
            .prefetch_related("genres")
            .exclude(summary__isnull=False)
            .order_by("id")
        )

        if limit:
            books = books[:limit]

        service = SummaryBatchService(
            model=DEFAULT_MODEL,
        )

        estimator = SummaryTokenEstimator(
            model=DEFAULT_MODEL,
        )

        export_dir = self._build_output_directory()

        exported, batch_count = self._export_books(
            books=books,
            service=service,
            estimator=estimator,
            export_dir=export_dir,
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Exported {exported:,} books into {batch_count} batch file(s)."
            )
        )

    def _export_books(
        self,
        *,
        books,
        service,
        estimator,
        export_dir: Path,
    ):
        exported = 0
        batch_number = 1

        current_books = []
        current_tokens = 0

        for book in books:

            estimated_tokens = estimator.estimate(
                title=book.title,
                author=book.author.name,
                genres=[
                    genre.name
                    for genre in book.genres.all()
                ],
                description=book.description,
            )

            if (
                current_books
                and (
                    len(current_books) >= MAX_REQUESTS
                    or current_tokens + estimated_tokens > MAX_ENQUEUED_TOKENS
                )
            ):
                self._write_batch(
                    books=current_books,
                    service=service,
                    export_dir=export_dir,
                    batch_number=batch_number,
                    estimated_tokens=current_tokens,
                )

                exported += len(current_books)

                batch_number += 1
                current_books = []
                current_tokens = 0

            current_books.append(book)
            current_tokens += estimated_tokens

            if (exported + len(current_books)) % 500 == 0:
                self.stdout.write(
                    f"Prepared {exported + len(current_books):,} books..."
                )

        if current_books:
            self._write_batch(
                books=current_books,
                service=service,
                export_dir=export_dir,
                batch_number=batch_number,
                estimated_tokens=current_tokens,
            )

            exported += len(current_books)

        return exported, batch_number

    def _build_output_directory(self) -> Path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        export_dir = (
            Path(__file__).resolve().parents[2]
            / "batch"
            / "summary"
            / f"summary_batch_{PROMPT_VERSION}_{DEFAULT_MODEL.replace(':', '_')}_{timestamp}"
        )

        export_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        return export_dir

    def _write_batch(
        self,
        *,
        books,
        service,
        export_dir: Path,
        batch_number: int,
        estimated_tokens: int,
    ):
        output_path = (
            export_dir
            / f"part{batch_number:03}.jsonl"
        )

        with output_path.open(
            "w",
            encoding="utf-8",
        ) as file:

            for book in books:
                request = service.build_request(
                    custom_id=f"book-{book.id}",
                    title=book.title,
                    author=book.author.name,
                    genres=[
                        genre.name
                        for genre in book.genres.all()
                    ],
                    description=book.description,
                )

                json.dump(
                    request,
                    file,
                    ensure_ascii=False,
                )

                file.write("\n")

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {output_path.relative_to(export_dir.parent)}"
            )
        )
        self.stdout.write(f"  Books: {len(books):,}")
        self.stdout.write(
            f"  Estimated prompt tokens: {estimated_tokens:,}"
        )
        self.stdout.write("")
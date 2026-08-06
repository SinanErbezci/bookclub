from itertools import islice

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from ai.models import BookEmbedding
from ai.services.embeddings import (
    EmbeddingService,
    build_summary_embedding_text,
)
from ai.models import BookSummary


def batched(iterable, size):
    """
    Yield lists of at most `size` items from an iterable.
    """
    iterator = iter(iterable)

    while batch := list(islice(iterator, size)):
        yield batch


class Command(BaseCommand):
    help = "Generate summary embeddings for books."

    def add_arguments(self, parser):
        parser.add_argument(
            "--batch-size",
            type=int,
            default=256,
            help="Number of books to embed in one batch.",
        )

    def handle(self, *args, **options):
        batch_size = options["batch_size"]

        summaries = BookSummary.objects.select_related("book").prefetch_related(
            "book__genres"
        )

        summaries = summaries.exclude(
            book__embeddings__embedding_type=BookEmbedding.EmbeddingType.SUMMARY,
        )

        total = summaries.count()

        if total == 0:
            self.stdout.write(
                self.style.SUCCESS("No books require summary embeddings.")
            )
            return

        self.stdout.write("Loading embedding model...")

        service = EmbeddingService()

        self.stdout.write(f"Generating summary embeddings for {total:,} books...")

        processed = 0

        for batch in batched(summaries.iterator(chunk_size=batch_size), batch_size):
            texts = [build_summary_embedding_text(summary) for summary in batch]

            embeddings = service.embed_documents(texts)
            book_embeddings = []

            for summary, embedding in zip(batch, embeddings, strict=True):
                book_embeddings.append(
                    BookEmbedding(
                        book_id=summary.book_id,
                        embedding_type=BookEmbedding.EmbeddingType.SUMMARY,
                        model_name=settings.EMBEDDING_MODEL_NAME,
                        embedding=embedding,
                    )
                )
            with transaction.atomic():
                BookEmbedding.objects.bulk_create(
                    book_embeddings,
                    batch_size=batch_size,
                )

            processed += len(batch)

            self.stdout.write(f"Processed {processed:,}/{total:,} books...")

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully generated {processed:,} summary embeddings."
            )
        )

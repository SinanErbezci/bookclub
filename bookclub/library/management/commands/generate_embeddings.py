import logging

from django.core.management.base import BaseCommand
from django.db import transaction

from ai.services.embeddings import (
    EmbeddingService,
    build_book_embedding_text,
)
from library.models import Book

logger = logging.getLogger(__name__)

BATCH_SIZE = 128


class Command(BaseCommand):
    help = "Generate embeddings for books."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            help="Maximum number of books to process.",
        )

    def handle(self, *args, **options):
        limit = options["limit"]

        base_queryset = (
            Book.objects
            .filter(text_embedding__isnull=True)
            .select_related("author")
            .prefetch_related("genres")
            .order_by("id")
        )

        total_books = (
            min(limit, base_queryset.count())
            if limit is not None
            else base_queryset.count()
        )

        if total_books == 0:
            logger.info("No books require embeddings.")
            return

        logger.info(
            "Generating embeddings for %d books.",
            total_books,
        )

        service = EmbeddingService()

        processed = 0
        last_id = 0

        while True:
            batch_queryset = (
                base_queryset
                .filter(id__gt=last_id)
            )

            if limit is not None:
                remaining = limit - processed

                if remaining <= 0:
                    break

                batch_queryset = batch_queryset[:min(BATCH_SIZE, remaining)]
            else:
                batch_queryset = batch_queryset[:BATCH_SIZE]

            batch = list(batch_queryset)

            if not batch:
                break

            with transaction.atomic():
                texts = [
                    build_book_embedding_text(book)
                    for book in batch
                ]

                embeddings = service.generate_batch(texts)

                for book, embedding in zip(batch, embeddings):
                    book.text_embedding = embedding

                Book.objects.bulk_update(
                    batch,
                    ["text_embedding"],
                )

            processed += len(batch)
            last_id = batch[-1].id

            logger.info(
                "Processed %d/%d books (%.1f%%).",
                processed,
                total_books,
                processed / total_books * 100,
            )

        logger.info(
            "Successfully generated embeddings for %d books.",
            processed,
        )
from itertools import islice

from django.conf import settings
from django.core.management.base import BaseCommand

from ai.models import BookEmbedding
from ai.services.embeddings import (
    EmbeddingService,
    build_description_embedding_text,
)
from library.models import Book


def batched(iterable, size):
    """
    Yield lists of at most `size` items from an iterable.
    """
    iterator = iter(iterable)

    while batch := list(islice(iterator, size)):
        yield batch


class Command(BaseCommand):
    help = "Generate description embeddings for books."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            help="Limit the number of books to process.",
        )

        parser.add_argument(
            "--batch-size",
            type=int,
            default=64,
            help="Number of books to embed in one batch.",
        )

    def handle(self, *args, **options):
        limit = options.get("limit")
        batch_size = options["batch_size"]

        books = (
            Book.objects
            .prefetch_related("genres")
            .exclude(
                embeddings__embedding_type=BookEmbedding.EmbeddingType.DESCRIPTION,
            )
        )

        if limit:
            books = books[:limit]

        total = books.count()

        if total == 0:
            self.stdout.write(
                self.style.SUCCESS(
                    "No books require description embeddings."
                )
            )
            return

        self.stdout.write("Loading embedding model...")

        service = EmbeddingService()

        self.stdout.write(
            f"Generating description embeddings for {total:,} books..."
        )

        processed = 0

        for batch in batched(books.iterator(chunk_size=batch_size), batch_size):
            texts = [
                build_description_embedding_text(book)
                for book in batch
            ]

            embeddings = service.embed_texts(texts)

            for book, embedding in zip(batch, embeddings):
                BookEmbedding.objects.update_or_create(
                    book=book,
                    embedding_type=BookEmbedding.EmbeddingType.DESCRIPTION,
                    defaults={
                        "model_name": settings.EMBEDDING_MODEL_NAME,
                        "embedding": embedding,
                    },
                )

            processed += len(batch)

            self.stdout.write(
                f"Processed {processed:,}/{total:,} books..."
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully generated {processed:,} description embeddings."
            )
        )
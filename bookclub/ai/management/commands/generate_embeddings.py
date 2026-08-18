from itertools import islice

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from ai.models import BookEmbedding, BookSummary
from ai.services.embeddings import (
    EmbeddingService,
    build_description_embedding_text,
    build_summary_embedding_text,
    build_summary_without_title_embedding_text,
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
    help = "Generate book embeddings."

    def add_arguments(self, parser):
        parser.add_argument(
            "embedding_type",
            choices=BookEmbedding.EmbeddingType.values,
        )

        parser.add_argument(
            "--batch-size",
            type=int,
            default=256,
        )

        parser.add_argument(
            "--limit",
            type=int,
        )

    def handle(self, *args, **options):
        embedding_type = options["embedding_type"]
        batch_size = options["batch_size"]
        limit = options["limit"]

        match embedding_type:
            case BookEmbedding.EmbeddingType.DESCRIPTION:
                queryset = (
                    Book.objects
                    .prefetch_related("genres")
                    .exclude(
                        embeddings__embedding_type=embedding_type,
                    )
                )

                builder = build_description_embedding_text

            case BookEmbedding.EmbeddingType.SUMMARY:
                queryset = (
                    BookSummary.objects
                    .select_related("book")
                    .prefetch_related("book__genres")
                    .exclude(
                        book__embeddings__embedding_type=embedding_type,
                    )
                )

                builder = build_summary_embedding_text

            case BookEmbedding.EmbeddingType.SUMMARY_NO_TITLE:
                queryset = (
                    BookSummary.objects
                    .select_related("book")
                    .prefetch_related("book__genres")
                    .exclude(
                        book__embeddings__embedding_type=embedding_type,
                    )
                )

                builder = build_summary_without_title_embedding_text

            case _:
                raise ValueError(
                    f"Unsupported embedding type: {embedding_type}"
                )

        if limit:
            queryset = queryset[:limit]

        total = queryset.count()

        if total == 0:
            self.stdout.write(
                self.style.SUCCESS(
                    "No embeddings to generate."
                )
            )
            return

        self.stdout.write("Loading embedding model...")

        service = EmbeddingService()

        self.stdout.write(
            f"Generating {embedding_type} embeddings "
            f"for {total:,} books..."
        )

        processed = 0

        for batch in batched(
            queryset.iterator(chunk_size=batch_size),
            batch_size,
        ):
            texts = [
                builder(item)
                for item in batch
            ]

            embeddings = service.embed_documents(texts)

            book_embeddings = []

            for item, embedding in zip(
                batch,
                embeddings,
                strict=True,
            ):
                if isinstance(item, Book):
                    book_id = item.id
                else:
                    book_id = item.book_id

                book_embeddings.append(
                    BookEmbedding(
                        book_id=book_id,
                        embedding_type=embedding_type,
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

            self.stdout.write(
                f"Processed {processed:,}/{total:,}..."
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully generated "
                f"{processed:,} {embedding_type} embeddings."
            )
        )
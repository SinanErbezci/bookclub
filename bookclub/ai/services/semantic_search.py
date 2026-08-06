"""
Utilities for semantic book search using pgvector.
"""

from __future__ import annotations

import logging

from pgvector.django import CosineDistance

from .embeddings import EmbeddingService
from library.models import Book
from ai.models import BookEmbedding

logger = logging.getLogger(__name__)


class SemanticSearchService:
    """Service responsible for semantic book search."""

    def __init__(
        self,
        embedding_service: EmbeddingService | None = None,
    ) -> None:
        self.embedding_service = embedding_service or EmbeddingService()

    def search(
        self,
        query: str,
        embedding_type: BookEmbedding.EmbeddingType = (
            BookEmbedding.EmbeddingType.SUMMARY
        ),
        limit: int = 10,
    ) -> list[Book]:
        """
        Return the books most semantically similar to the query.
        """

        if embedding_type not in BookEmbedding.EmbeddingType.values:
            raise ValueError(f"Unknown embedding type: {embedding_type}")
        query = query.strip()

        if not query:
            raise ValueError("Search query cannot be empty.")

        if limit <= 0:
            raise ValueError("Limit must be greater than zero.")

        logger.info("Generating query embedding.")

        query_embedding = self.embedding_service.embed_query(query)


        logger.info("Searching for similar books.")

        embeddings = list(
            BookEmbedding.objects.filter(
                embedding_type=embedding_type,
            )
            .select_related("book")
            .annotate(
                distance=CosineDistance(
                    "embedding",
                    query_embedding,
                )
            )
            .order_by("distance")[:limit]
        )

        books = []

        for item in embeddings:
            item.book.distance = item.distance
            books.append(item.book)

        logger.info(
            "Found %d matching books.",
            len(books),
        )

        return books

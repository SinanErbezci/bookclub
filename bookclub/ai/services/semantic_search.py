"""
Utilities for semantic book search using pgvector.
"""

from __future__ import annotations

import logging

from pgvector.django import CosineDistance

from .embeddings import EmbeddingService
from library.models import Book

logger = logging.getLogger(__name__)


class SemanticSearchService:
    """Service responsible for semantic book search."""

    def __init__(
        self,
        embedding_service: EmbeddingService | None = None,
    ) -> None:
        self.embedding_service = (
            embedding_service
            or EmbeddingService()
        )

    def search(
        self,
        query: str,
        limit: int = 10,
    ) -> list[Book]:
        """
        Return the books most semantically similar to the query.
        """
        query = query.strip()

        if not query:
            raise ValueError("Search query cannot be empty.")

        if limit <= 0:
            raise ValueError("Limit must be greater than zero.")

        logger.info("Generating query embedding.")

        query_embedding = self.embedding_service.generate(
            query
        )

        logger.info("Searching for similar books.")

        books = list(
            Book.objects
            .annotate(
                distance=CosineDistance(
                    "text_embedding",
                    query_embedding,
                )
            )
            .order_by("distance")[:limit]
        )

        logger.info(
            "Found %d matching books.",
            len(books),
        )

        return books
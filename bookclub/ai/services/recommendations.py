"""
Utilities for book recommendations using pgvector.
"""
from __future__ import annotations
import logging

from pgvector.django import CosineDistance

from library.models import Book

logger = logging.getLogger(__name__)

class RecommendationService:
    """Service responsible for book recommendations."""

    def recommend(
        self,
        book: Book,
        limit: int = 8,
    ) -> list[Book]:
        """
        Return books that are semantically similar
        to the given book.
        """
        if limit <= 0:
            raise ValueError(
                "Limit must be greater than zero."
            )

        if book.text_embedding is None:
            return []

        logger.info(
            "Finding recommendations for '%s'.",
            book.title,
        )

        recommendations = list(
            Book.objects
            .filter(
                text_embedding__isnull=False,
            )
            .exclude(
                id=book.id,
            )
            .annotate(
                distance=CosineDistance(
                    "text_embedding",
                    book.text_embedding,
                )
            )
            .order_by("distance")[:limit]
        )

        logger.info(
            "Found %d recommendations.",
            len(recommendations),
        )

        return recommendations
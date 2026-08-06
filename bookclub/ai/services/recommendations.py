"""
Utilities for book recommendations using pgvector.
"""

from __future__ import annotations

import logging

from pgvector.django import CosineDistance

from library.models import Book
from ai.models import BookEmbedding

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
            raise ValueError("Limit must be greater than zero.")

        book_embedding = BookEmbedding.objects.filter(
            book=book,
            embedding_type=BookEmbedding.EmbeddingType.SUMMARY
        ).first()

        if book_embedding is None:
            return []

        logger.info(
            "Finding recommendations for '%s'.",
            book.title,
        )

        candidates = self._retrieve_candidates(
            book,
            book_embedding.embedding,
        )

        logger.info(
            "Retrieved %d candidates.",
            len(candidates),
        )

        recommendations = self._filter_candidates(
            candidates,
            limit,
        )

        logger.info(
            "Returning %d recommendations.",
            len(recommendations),
        )

        return recommendations

    def _retrieve_candidates(
        self,
        book: Book,
        embedding: list[float],
        candidate_limit: int = 100,
    ) -> list[Book]:
        """
        Retrieve the most semantically similar books.
        """
        embeddings = list(
            BookEmbedding.objects
            .filter(
                embedding_type=BookEmbedding.EmbeddingType.SUMMARY,
            )
            .exclude(
                book=book,
            )
            .select_related("book")
            .annotate(
                distance=CosineDistance(
                    "embedding",
                    embedding,
                )
            )
            .order_by("distance")[:candidate_limit]
        )

        candidates = []

        for item in embeddings:
            item.book.distance = item.distance
            candidates.append(item.book)

        return candidates

    def _filter_candidates(
        self,
        candidates: list[Book],
        limit: int,
    ) -> list[Book]:
        """
        Filter and rank recommendation candidates.
        """
        recommendations: list[Book] = []

        for candidate in candidates:
            if self._is_collection(candidate):
                continue

            recommendations.append(candidate)

            if len(recommendations) == limit:
                break

        return recommendations

    def _is_collection(
        self,
        book: Book,
    ) -> bool:
        """
        Return whether the book appears to be a collection,
        omnibus, or boxed set.
        """
        title = book.title.lower()

        keywords = (
            "collection",
            "boxed set",
            "box set",
            "omnibus",
        )

        return any(keyword in title for keyword in keywords)

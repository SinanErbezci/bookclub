"""
Utilities for book recommendations using pgvector.
"""

from __future__ import annotations

import logging

from pgvector.django import CosineDistance
from django.db import connection,  transaction

from library.models import Book
from ai.models import BookEmbedding
from ai.services.recommendation_candidate import RecommendationCandidate

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
            embedding_type=BookEmbedding.EmbeddingType.SUMMARY_NO_TITLE
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

        recommendations = self._process_candidates(
            book=book,
            candidates=candidates,
            limit=limit,
        )

        logger.info(
            "Returning %d recommendations.",
            len(recommendations),
        )

        return [
            candidate.book
            for candidate in recommendations
        ]


    def _retrieve_candidates(
        self,
        book: Book,
        embedding: list[float],
        candidate_limit: int = 50,
    ) -> list[RecommendationCandidate]:
        """
        Retrieve the most semantically similar books.
        """
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SET LOCAL hnsw.ef_search = %s",
                    [60],
                )

            embeddings = list(
                BookEmbedding.objects
                .filter(
                    embedding_type=BookEmbedding.EmbeddingType.SUMMARY_NO_TITLE,
                )
                .exclude(
                    book=book,
                )
                .select_related("book")
                .prefetch_related("book__genres")
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
            similarity = 1 - item.distance

            candidate = RecommendationCandidate(
                    book=item.book,
                    distance=item.distance,
                    similarity=similarity,
                    score=similarity,
                )
            candidate.debug["similarity"] = similarity
            candidates.append(candidate)

        return candidates

    def _process_candidates(
        self,
        book: Book,
        candidates: list[RecommendationCandidate],
        limit: int,
    ) -> list[RecommendationCandidate]:
        """
        Filter and rank recommendation candidates.
        """
        recommendations: list[RecommendationCandidate] = []

        seen_series: set[int] = set()
        seen_authors: set[int] = set()

        if book.series_id is not None:
            seen_series.add(book.series_id)
        if book.author.id is not None:
            seen_authors.add(book.author_id)

        source_genres = {
            genre.id
            for genre in book.genres.all()
        }

        examined = 0

        for candidate in candidates:
            examined += 1

            if not self._same_language(book, candidate):
                continue

            if self._is_collection(candidate.book):
                continue

            if self._same_series(candidate, seen_series):
                continue

            if self._has_seen_author(candidate, seen_authors):
                continue

            recommendations.append(candidate)

            if candidate.book.series_id is not None:
                seen_series.add(candidate.book.series_id)

            if candidate.book.author_id is not None:
                seen_authors.add(candidate.book.author_id)

            self._apply_genre_bonus(
                source_genres,
                candidate,
            )

            if len(recommendations) == limit:
                break

        logger.info(
            "Recommendation filtering: "
            "examined=%d available=%d returned=%d "
            "language=%d collection=%d series=%d author=%d",
            examined,
            len(candidates),
            len(recommendations),
        )

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

    def _same_language(
            self,
            source: Book,
            candidate: RecommendationCandidate,
    ) -> bool:
        """
        Return whether the candidate is written in the same language as the source book.
        """
        if not source.language or not candidate.book.language:
            return True

        return source.language == candidate.book.language

    def _same_series(
        self,
        candidate: RecommendationCandidate,
        seen_series: set[int],
    ) -> bool:
        """
        Return whether the candidate belongs to a series that has
        already been recommended.
        """
        series_id = candidate.book.series_id

        if series_id is None:
            return False

        return series_id in seen_series

    def _has_seen_author(
        self,
        candidate: RecommendationCandidate,
        seen_authors: set[int],
    ) -> bool:
        """
        Return whether the candidate was written by an author that has
        already been recommended.
        """
        author_id = candidate.book.author_id

        if author_id is None:
            return False

        return author_id in seen_authors

    def _apply_genre_bonus(
        self,
        source_genres: set[int],
        candidate: RecommendationCandidate,
    ) -> None:
        candidate_genres = {
            genre.id
            for genre in candidate.book.genres.all()
        }

        shared = source_genres & candidate_genres

        bonus = min(
            len(shared) * 0.01,
            0.05,
        )
        candidate.score += bonus
        candidate.debug["genre_bonus"] = bonus
        candidate.debug["shared_genres"] = len(shared)

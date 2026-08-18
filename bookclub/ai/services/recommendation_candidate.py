from dataclasses import dataclass, field

from library.models import Book


@dataclass(slots=True)
class RecommendationCandidate:
    book: Book
    distance: float
    similarity: float
    score: float
    debug: dict[str, float] = field(default_factory=dict)
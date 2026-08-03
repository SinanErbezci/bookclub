from ..prompts.recommendation import (
    RECOMMENDATION_SYSTEM_PROMPT,
    build_recommendation_user_prompt,
)

from .providers.base import SummaryProvider


class ExplanationService:
    def __init__(self, provider: SummaryProvider):
        self.provider = provider

    def explain_book_recommendation(
        self,
        source_book,
        recommended_book,
    ) -> str:
        prompt = build_recommendation_user_prompt(
            source_book,
            recommended_book,
        )

        return self.provider.generate(
            system_prompt=RECOMMENDATION_SYSTEM_PROMPT,
            user_prompt=prompt,
        )
from .llm import LLMService
from ..prompts.recommendation import (
    RECOMMENDATION_SYSTEM_PROMPT,
    build_recommendation_user_prompt,
)


class ExplanationService:
    def __init__(self):
        self.llm = LLMService()

    def explain_book_recommendation(self, source_book, recommended_book) -> str:
        prompt = build_recommendation_user_prompt(
            source_book,
            recommended_book,
        )

        print(prompt)
        print("-" * 80)

        return self.llm.generate(
            system_prompt=RECOMMENDATION_SYSTEM_PROMPT,
            user_prompt=prompt,
        )
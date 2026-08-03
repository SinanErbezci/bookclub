from bookclub.ai.prompts.summary_v1 import (
    SYSTEM_PROMPT,
    USER_PROMPT_TEMPLATE,
)

from .providers.base import SummaryProvider


class SummaryService:
    def __init__(self, provider: SummaryProvider):
        self.provider = provider

    def generate(
        self,
        *,
        title: str,
        author: str,
        genres: list[str],
        description: str,
    ) -> str:

        user_prompt = self._build_user_prompt(
            title=title,
            author=author,
            genres=genres,
            description=description,
        )

        return self.provider.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

    def _build_user_prompt(
        self,
        *,
        title: str,
        author: str,
        genres: list[str],
        description: str,
    ) -> str:
        return USER_PROMPT_TEMPLATE.format(
            title=title,
            author=author,
            genres=", ".join(genres),
            description=description,
        )



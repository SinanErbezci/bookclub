from ai.prompts.summary_v2 import (
    SYSTEM_PROMPT,
    USER_PROMPT_TEMPLATE,
)

MAX_DESCRIPTION_LENGTH = 4000


class SummaryPromptBuilder:
    """Build prompts for summary generation."""

    @property
    def system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def build_user_prompt(
        self,
        *,
        title: str,
        author: str,
        genres: list[str],
        description: str,
    ) -> str:
        description = self._truncate_description(description)

        return USER_PROMPT_TEMPLATE.format(
            title=title,
            author=author,
            genres=", ".join(genres),
            description=description,
        )

    def _truncate_description(
        self,
        description: str,
    ) -> str:
        if len(description) <= MAX_DESCRIPTION_LENGTH:
            return description

        truncated = description[:MAX_DESCRIPTION_LENGTH]

        last_space = truncated.rfind(" ")

        if last_space != -1:
            truncated = truncated[:last_space]

        return truncated
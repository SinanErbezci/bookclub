from .prompt_builder import SummaryPromptBuilder


class SummaryBatchService:
    """Build OpenAI Batch API requests for book summaries."""

    def __init__(
        self,
        *,
        model: str,
    ) -> None:
        self.model = model
        self.prompt_builder = SummaryPromptBuilder()

    def _build_input(
        self,
        user_prompt: str,
    ) -> list[dict]:
        return [
            {
                "role": "system",
                "content": self.prompt_builder.system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ]

    def build_request(
        self,
        *,
        custom_id: str,
        title: str,
        author: str,
        genres: list[str],
        description: str,
    ) -> dict:
        user_prompt = self.prompt_builder.build_user_prompt(
            title=title,
            author=author,
            genres=genres,
            description=description,
        )

        return {
            "custom_id": custom_id,
            "method": "POST",
            "url": "/v1/responses",
            "body": {
                "model": self.model,
                "input": self._build_input(user_prompt),
            },
        }

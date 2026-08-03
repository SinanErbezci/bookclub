from openai import OpenAI, OpenAIError
from django.conf import settings

from .base import SummaryProvider


DEFAULT_MODEL = "gpt-4.1-mini"


class OpenAISummaryProvider(SummaryProvider):
    name = "openai"
    
    def __init__(
        self,
        *,
        model: str = DEFAULT_MODEL,
        client: OpenAI | None = None,
    ):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured.")

        self.model = model
        self.client = client or OpenAI(
            api_key=settings.OPENAI_API_KEY,
        )

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        try:
            response = self.client.responses.create(
                model=self.model,
                input=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
            )

            return response.output_text.strip()

        except OpenAIError as exc:
            raise RuntimeError(f"OpenAI request failed: {exc}") from exc
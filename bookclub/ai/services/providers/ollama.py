from ollama import Client, ResponseError

from .base import SummaryProvider

import os

DEFAULT_MODEL = "qwen3:8b"

DEFAULT_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://127.0.0.1:11434",
)
print(DEFAULT_HOST)
class OllamaSummaryProvider(SummaryProvider):
    name = "ollama"
    
    def __init__(
        self,
        *,
        model: str = DEFAULT_MODEL,
        client: Client | None = None,
    ):
        self.model = model
        self.client = client or Client(host=DEFAULT_HOST)

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        try:
            response = self.client.chat(
                model=self.model,
                think=False,
                messages=[
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

            return response.message.content.strip()

        except ResponseError as exc:
            raise RuntimeError(f"Ollama request failed: {exc}") from exc
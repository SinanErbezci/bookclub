from ollama import Client, ResponseError

from .base import SummaryProvider
from ..result import SummaryResult
import os

DEFAULT_MODEL = "qwen3:4b-instruct"

DEFAULT_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://127.0.0.1:11434",
)


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
    ) -> SummaryResult:
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

            return SummaryResult(
                summary=response.message.content.strip(),
                prompt_tokens=response.prompt_eval_count,
                completion_tokens=response.eval_count,
                total_tokens=(response.prompt_eval_count + response.eval_count),
            )

        except ResponseError as exc:
            raise RuntimeError(f"Ollama request failed: {exc}") from exc

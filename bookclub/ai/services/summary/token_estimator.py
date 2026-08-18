import tiktoken

from .prompt_builder import SummaryPromptBuilder


class SummaryTokenEstimator:
    def __init__(
        self,
        *,
        model: str,
    ):
        self.prompt_builder = SummaryPromptBuilder()

        self.encoding = tiktoken.encoding_for_model(
            model,
        )

    def estimate(
        self,
        *,
        title: str,
        author: str,
        genres: list[str],
        description: str,
    ) -> int:

        user_prompt = self.prompt_builder.build_user_prompt(
            title=title,
            author=author,
            genres=genres,
            description=description,
        )

        prompt = (
            self.prompt_builder.system_prompt
            + "\n"
            + user_prompt
        )

        return len(
            self.encoding.encode(prompt)
        )
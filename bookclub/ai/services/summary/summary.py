from .prompt_builder import SummaryPromptBuilder
from .providers.base import SummaryProvider
from .result import SummaryResult


class SummaryService:
    def __init__(self, provider: SummaryProvider):
        self.provider = provider
        self.prompt_builder = SummaryPromptBuilder()

    def generate(
        self,
        *,
        title: str,
        author: str,
        genres: list[str],
        description: str,
    ) -> SummaryResult:

        return self.provider.generate(
            system_prompt=self.prompt_builder.system_prompt,
            user_prompt=self.prompt_builder.build_user_prompt(
                title=title,
                author=author,
                genres=genres,
                description=description,
            ),
        )
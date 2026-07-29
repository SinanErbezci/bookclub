from abc import ABC, abstractmethod


class SummaryProvider(ABC):
    @abstractmethod
    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """Generate a summary from the supplied prompts."""
        raise NotImplementedError
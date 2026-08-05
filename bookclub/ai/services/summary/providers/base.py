from abc import ABC, abstractmethod
from ..result import SummaryResult

class SummaryProvider(ABC):
    @abstractmethod
    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> SummaryResult:
        """Generate a summary from the supplied prompts."""
        raise NotImplementedError
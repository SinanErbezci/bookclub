from .providers.base import SummaryProvider


def get_summary_provider() -> SummaryProvider:
    from .providers.openai import OpenAISummaryProvider

    return OpenAISummaryProvider()
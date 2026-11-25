from types import SimpleNamespace
from unittest.mock import Mock

from django.test import SimpleTestCase, override_settings

from .services.summary.providers.openai import OpenAISummaryProvider
from .services.summary.result import SummaryResult


class OpenAISummaryProviderTests(SimpleTestCase):
    @override_settings(OPENAI_API_KEY="test-only")
    def test_maps_summary_and_token_usage(self):
        client = Mock()
        client.responses.create.return_value = SimpleNamespace(
            output_text="  A story about the coast.  ",
            usage=SimpleNamespace(input_tokens=10, output_tokens=6, total_tokens=16),
        )
        provider = OpenAISummaryProvider(model="test-model", client=client)

        result = provider.generate(system_prompt="Summarize.", user_prompt="The Quiet Coast")

        self.assertEqual(result, SummaryResult("A story about the coast.", 10, 6, 16))
        client.responses.create.assert_called_once_with(
            model="test-model",
            input=[
                {"role": "system", "content": "Summarize."},
                {"role": "user", "content": "The Quiet Coast"},
            ],
        )

from django.core.management.base import BaseCommand

from bookclub.ai.services.llm import LLMService


class Command(BaseCommand):
    help = "Test the LLM service."

    def handle(self, *args, **options):
        llm = LLMService()

        response = llm.generate(
            system_prompt="You are a helpful assistant.",
            user_prompt="Say hello in one sentence.",
        )

        self.stdout.write(self.style.SUCCESS(response))
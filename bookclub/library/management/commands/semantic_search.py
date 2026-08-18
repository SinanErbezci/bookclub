import logging

from django.core.management.base import BaseCommand

from ai.services.semantic_search import SemanticSearchService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Perform a semantic search for books."

    def add_arguments(self, parser):
        parser.add_argument(
            "query",
            type=str,
            help="Natural language search query.",
        )

        parser.add_argument(
            "--limit",
            type=int,
            default=10,
            help="Maximum number of books to return.",
        )

    def handle(self, *args, **options):
        query = options["query"]
        limit = options["limit"]

        logger.info("Searching for: %s", query)

        service = SemanticSearchService()

        results = service.search(
            query=query,
            limit=limit,
        )

        if not results:
            self.stdout.write(
                self.style.WARNING("No matching books found.")
            )
            return

        for index, book in enumerate(results, start=1):
            self.stdout.write(
                f"{index:2}. "
                f"{book.distance:.4f}  "
                f"{book.title} "
                f"({book.author.name})"
            )
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from ai.models import BookSummary
from ai.prompts.summary_v2 import PROMPT_VERSION
from ai.services.summary.importer import SummaryBatchImporter


class Command(BaseCommand):
    help = "Import OpenAI Batch API summaries."

    def add_arguments(self, parser):
        parser.add_argument(
            "directory",
            type=Path,
            help="Directory containing Batch API output files.",
        )

    def handle(self, *args, **options):
        directory = options["directory"]

        if not directory.exists():
            self.stderr.write(self.style.ERROR(f"Directory not found: {directory}"))
            return

        importer = SummaryBatchImporter()

        if BookSummary.objects.exists():
            self.stderr.write(self.style.ERROR("BookSummary table is not empty."))
            return
        
        summaries = importer.import_directory(
            directory,
        )

        models = self._build_models(
            summaries,
        )

        self.stdout.write(f"Saving {len(models):,} summaries...")


        with transaction.atomic():
            BookSummary.objects.bulk_create(
                models,
                batch_size=1000,
            )

        self.stdout.write(self.style.SUCCESS(f"Imported {len(models):,} summaries."))

    def _build_models(
        self,
        summaries,
    ):
        models = []

        for summary in summaries:
            models.append(
                BookSummary(
                    book_id=summary.book_id,
                    content=summary.summary,
                    prompt_version=PROMPT_VERSION,
                    model_name=summary.model,
                    input_tokens=summary.input_tokens,
                    output_tokens=summary.output_tokens,
                    total_tokens=summary.total_tokens,
                )
            )

        return models

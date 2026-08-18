from pathlib import Path
import json

from django.core.management.base import BaseCommand

from ai.services.summary.openai_batch import OpenAIBatchService


class Command(BaseCommand):
    help = "Submit an OpenAI Batch API job."

    def add_arguments(self, parser):
        parser.add_argument(
            "file",
            type=Path,
            help="Batch JSONL file to submit.",
        )

    def handle(self, *args, **options):
        file_path = options["file"]

        if not file_path.exists():
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        service = OpenAIBatchService()

        self.stdout.write("Uploading batch file...")

        uploaded_file = service.upload_file(
            file_path,
        )

        self.stdout.write(self.style.SUCCESS(f"Uploaded: {uploaded_file.id}"))

        self.stdout.write("Creating batch...")

        batch = service.create_batch(
            input_file_id=uploaded_file.id,
        )

        self.stdout.write(self.style.SUCCESS(f"Batch created: {batch.id}"))

        self.stdout.write(f"Status: {batch.status}")

        self._save_metadata(
            file_path,
            uploaded_file,
            batch,
        )

    def _save_metadata(
        self,
        file_path: Path,
        uploaded_file,
        batch,
    ):
        metadata = {
            "jsonl_file": file_path.name,
            "jsonl_path": str(file_path),
            "file_id": uploaded_file.id,
            "batch_id": batch.id,
            "status": batch.status,
            "created_at": batch.created_at,
            "endpoint": batch.endpoint,
            "completion_window": batch.completion_window,
        }

        metadata_path = file_path.with_suffix(".metadata.json")

        with metadata_path.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                metadata,
                file,
                indent=4,
            )

        self.stdout.write(self.style.SUCCESS(f"Saved metadata: {metadata_path}"))

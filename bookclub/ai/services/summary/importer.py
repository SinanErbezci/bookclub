import re
import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class ImportedSummary:
    book_id: int
    summary: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int


class SummaryBatchImporter:
    """Parse OpenAI Batch API output files into ImportedSummary objects."""

    def import_directory(
        self,
        directory: Path,
    ) -> list[ImportedSummary]:
        """Import all output files in an export directory."""

        summaries = []

        output_files = sorted(
            directory.glob("*.output.jsonl")
        )

        for output_file in output_files:
            summaries.extend(
                self.import_file(output_file)
            )

        return summaries

    def _parse_response(self, response: dict) -> ImportedSummary:
        """Convert one OpenAI Batch API response into an ImportedSummary."""

        body = response["response"]["body"]

        match = re.fullmatch(
            r"book-(\d+)",
            response["custom_id"],
        )

        if match is None:
            raise ValueError(f"Invalid custom_id: {response['custom_id']}")

        book_id = int(match.group(1))

        return ImportedSummary(
            book_id=book_id,
            summary=body["output"][0]["content"][0]["text"],
            model=body["model"],
            input_tokens=body["usage"]["input_tokens"],
            output_tokens=body["usage"]["output_tokens"],
            total_tokens=body["usage"]["total_tokens"],
        )

    def import_file(
        self,
        file_path: Path,
    ) -> list[ImportedSummary]:
        """Import a single OpenAI Batch API output file."""

        summaries = []

        with file_path.open(
            "r",
            encoding="utf-8",
        ) as file:

            for line in file:
                response = json.loads(line)

                summaries.append(self._parse_response(response))

        return summaries
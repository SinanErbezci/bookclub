from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from library.etl_books import run_import


class Command(BaseCommand):
    help = "Import books from a CSV into PostgreSQL (idempotent using source_row_id)."

    def add_arguments(self, parser):
        parser.add_argument("--csv", required=True, help="Path to the CSV file")
        parser.add_argument("--rejects", default="etl_rejects.csv", help="Path for rejects CSV output")

    def handle(self, *args, **options):
        csv_path = options["csv"]
        rejects_csv = options["rejects"]

        db = settings.DATABASES["default"]
        service = (db.get("OPTIONS") or {}).get("service")
        if not service:
            raise CommandError("DATABASES['default']['OPTIONS']['service'] is not set.")

        dsn = f"service={service}"

        run_import(csv_path=csv_path, db_dsn=dsn, rejects_csv=rejects_csv)

        self.stdout.write(self.style.SUCCESS("ETL finished"))

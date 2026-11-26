# BookClub backend

## Running the backend tests

Run the tests from this directory in a Git checkout on a POSIX host. You need
Python 3.9 or newer, Git, and Docker Compose v2-compatible commands.
Validation used host Python 3.12.3 and Docker Compose v5.3.1.

```bash
python3 run_backend_tests.py
```

The launcher creates a private build context with only allowed source files.
It checks the filenames, sizes, and SHA-256 checksums against the source
allowlist and confirms that Compose uses that exact directory. Each run gets
its own Compose project and internal network with no published ports.

The launcher runs the Django system check and tests. It cleans up the
Compose project and staged directory after completion or a handled interruption
and reports cleanup errors separately. After cleanup, it returns the first
applicable nonzero status in this order.

1. The existing test status.
2. The handled signal's status, such as 143 for SIGTERM.
3. The cleanup failure status.

To test the launcher itself without Docker, run
`python3 -m unittest -v test_backend_launcher` from this directory.

The test image uses `python:3.12-slim` and installs
`requirements/django.txt`. That file records direct pins, including Django
6.0.8, Django REST Framework 3.18.2, psycopg 3.3.2, Python pgvector 0.5.0,
OpenAI 2.48.0, and Celery 5.6.3. The first build may download images and packages.
The disposable database uses `pgvector/pgvector:pg17` (PostgreSQL 17.10 in
validation). Migrations install `pg_trgm` and `vector`. Docker image tags can
move, and `httpx` and transitive Python dependencies can resolve to newer
versions. The execution plan records the versions observed during validation.

## Setting up the development environment

1. From `bookclub/`, create a Python 3.12 virtual environment and install
   the Django dependencies.

   ```sh
   python3.12 -m venv .venv
   source .venv/bin/activate
   python -m pip install -r requirements/django.txt
   ```

2. Start PostgreSQL and wait for it to accept connections. Run a separate local
   Redis instance on port 6379 for the Django cache and Celery.

   ```sh
   docker compose up -d db
   ```

3. Create `.env` next to `manage.py`. Set `DJANGO_SECRET_KEY` to a
   development-only key. Set `DEV_DATABASE_URL` to the local PostgreSQL URL
   using the database name, user, password, and published port from
   [docker-compose.yml](docker-compose.yml). The [base settings](mysite/settings/base.py)
   load `.env`. The [development settings](mysite/settings/development.py)
   select the database and Redis connections.

4. Apply migrations to create the local schema and search extensions, then
   start Django.

   ```sh
   python manage.py migrate
   python manage.py runserver localhost:8000
   ```

To load the catalog from a local CSV, see the
[catalog import command](library/management/commands/import_books_csv.py).
Semantic search needs stored catalog embeddings and a running
[embedding service](ai_service/app.py). Django reads the service base URL from
`AI_SERVICE_URL`. See [Search and AI](../docs/architecture.md#search-and-ai)
for the request flow and source links.

For GPU acceleration on Windows or Linux, use the official PyTorch installation
guide to choose the build for your hardware.

The [development settings](mysite/settings/development.py) replace the
[base throttle rates](mysite/settings/base.py) and omit rates for scoped routes
such as login, signup, and search. Use the
[isolated backend suite](#running-the-backend-tests) to check those routes for
regressions.

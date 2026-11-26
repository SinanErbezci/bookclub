If you want GPU acceleration on Windows/Linux, install the appropriate PyTorch build for your hardware using the official PyTorch installation guide.

## Running the backend tests

From this directory in a Git checkout on a POSIX host, use Python 3.9 or newer,
Git, and Docker Compose v2-compatible commands. Validation used host Python
3.12.3 and Docker Compose v5.3.1.

```bash
python3 run_backend_tests.py
```

The launcher creates a private source-only context, verifies the filenames,
sizes, and SHA-256 checksums against its source allowlist, and checks that
Compose resolves that exact directory. Each invocation uses a unique Compose
project and internal network with no published ports. It runs the Django
system check and tests, then cleans up its project and staged directory on
completion or a handled interruption. Cleanup errors are reported separately.
After cleanup, the launcher returns an existing nonzero test status first,
then a handled signal's status (such as 143 for SIGTERM), then a nonzero status
for cleanup failure. To check the launcher itself without Docker, run
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

2. Start the local PostgreSQL service. Wait for it to accept connections.
   Start a separate local Redis instance on port 6379 for the Django cache
   and Celery configuration.

   ```sh
   docker compose up -d db
   ```

3. Create `.env` alongside `manage.py`. Set `DJANGO_SECRET_KEY` to a
   development-only key and `DEV_DATABASE_URL` to the local PostgreSQL
   connection URL. Use the database name, user, password, and published port
   from [docker-compose.yml](docker-compose.yml). [Base settings](mysite/settings/base.py)
   load the file, and [development settings](mysite/settings/development.py)
   select the development database and Redis connections.

4. Apply migrations to the local database and start Django.

   ```sh
   python manage.py migrate
   python manage.py runserver localhost:8000
   ```

Migrations create the schema and search extensions. To populate the catalog
from a local CSV, see the [catalog import command](library/management/commands/import_books_csv.py).
For semantic search, use a running [embedding service](ai_service/app.py) and
stored catalog embeddings. Django reads the service base URL from
`AI_SERVICE_URL`. See [Search and AI](../docs/architecture.md#search-and-ai)
for the source paths.

The development profile replaces the base throttle rates and omits rates for
scoped routes such as login, signup, and search. Use the
[isolated backend suite](#running-the-backend-tests) for regression checks on
those routes. See [base](mysite/settings/base.py) and
[development](mysite/settings/development.py) settings.

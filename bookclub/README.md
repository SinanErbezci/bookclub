# BookClub backend

The Django backend provides the REST API for BookClub, handling book discovery, user authentication, reviews, personal book lists, recommendations, and AI-powered search.

Built with **Django 6**, **Django REST Framework**, and **PostgreSQL**, it also integrates Redis for caching, Celery for asynchronous tasks, and a separate FastAPI service for generating vector embeddings.

For the complete application architecture and deployment details, see the [main BookClub README](../README.md).

## Project Structure

| Directory | Responsibility |
|---|---|
| `library/` | Models, serializers, API views, authentication, reviews, lists, and Celery tasks |
| `ai/` | Semantic search, recommendations, LLM integration, and batch processing |
| `ai_service/` | FastAPI embedding service |
| `mysite/` | Django configuration, URLs, middleware, Celery configuration, and health checks |
| `requirements/` | Python dependency files |
| `nginx/` | Nginx configuration retained in the repository |
| `docker-compose.yml` | Local PostgreSQL with pgvector |

## Setting up the development environment

1. From `bookclub/`, create a Python 3.12 virtual environment and install
   the Django dependencies.

   ```sh
   python3.12 -m venv .venv
   source .venv/bin/activate
   python -m pip install -r requirements/django.txt
   ```

2. Start PostgreSQL and wait for it to accept connections. Run a separate local
   Redis instance on port 6379 for the Django cache and Celery. The Compose
   database uses PostgreSQL 17 with pgvector.

   ```sh
   docker compose up -d db
   docker run --rm -p 127.0.0.1:6379:6379 redis:7
   ```

3. Create `.env` next to `manage.py`. Set `DJANGO_SECRET_KEY` to a
   development-only key. Set `DEV_DATABASE_URL` to the local PostgreSQL URL
   using the database name, user, password, and published port from
   [docker-compose.yml](docker-compose.yml). The [base settings](mysite/settings/base.py)
   load `.env`. The [development settings](mysite/settings/development.py)
   select the local database and Redis connections by default when you use
   `manage.py`. Use these values for the default Compose database.

   ```dotenv
   DJANGO_SECRET_KEY=replace-with-a-local-development-secret
   DEV_DATABASE_URL=postgresql://bookclub:bookclub@localhost:5432/bookclub
   ```

4. Apply migrations to create the local schema and search extensions, then
   start Django.

   ```sh
   python manage.py migrate
   python manage.py runserver localhost:8000
   ```

The API is available at `http://localhost:8000`. Import the catalog separately
after applying migrations. To load data from a local CSV, see the
[catalog import command](library/management/commands/import_books_csv.py).
Semantic search needs stored catalog embeddings and a running
[embedding service](ai_service/app.py). Django reads the service base URL from
`AI_SERVICE_URL`. See [Search and AI](../docs/architecture.md#search-and-ai)
for the request flow and source links.

For GPU acceleration on Windows or Linux, use the official PyTorch installation
guide to choose the build for your hardware.

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

CI runs `python manage.py test library.tests -v 2` with development settings
and disposable PostgreSQL and Redis services. The launcher also discovers
tests in the AI app.

## API Endpoints

| Endpoint | Description |
|---|---|
| `/api/books/` | Browse and retrieve books |
| `/api/authors/` | Browse authors |
| `/api/genres/` | Browse genres |
| `/api/search/` | Full-text and trigram-based search |
| `/api/search/semantic/` | Semantic search |
| `/api/reviews/` | Book reviews |
| `/api/lists/` | Personal book lists |
| `/api/books/{id}/recommendations/` | Similar-book recommendations |
| `/api/login/`, `/api/signup/`, `/api/logout/` | Session-based authentication |
| `/api/me/`, `/api/csrf/` | User session and CSRF endpoints |

Login and signup require a CSRF token and cookie from `GET /api/csrf/`.
Authenticated writes use Django session cookies and CSRF protection. The
development configuration allows credentialed CORS from
`http://localhost:5173`. See the [authentication flow](../docs/architecture.md#authentication-and-csrf).

## Background Tasks & Caching

BookClub uses **Celery and Celery Beat** for background processing, including welcome emails and scheduled homepage cache updates.

In development, Redis serves as the Celery broker and cache backend. In production, Celery uses Amazon SQS as its broker, while Amazon ElastiCache Redis provides application caching.

## Health Checks & Observability

The backend exposes operational endpoints used by Kubernetes and Prometheus:

| Endpoint | Purpose |
|---|---|
| `/health/live/` | Liveness check |
| `/health/ready/` | Database readiness check |
| `/metrics` | Prometheus metrics |

The application instruments HTTP and database activity using `django-prometheus`.

## Related Documentation

- [Main BookClub README](../README.md) — Application architecture, AI features, and technology stack
- [Infrastructure README](../infra/README.md) — Terraform, AWS infrastructure, and provisioning
- [Architecture notes](../docs/architecture.md) — Source links for authentication, search, configuration, and validation

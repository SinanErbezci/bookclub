# BookClub — Django Backend

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

## Local Development

### Prerequisites

- Python 3.12
- Docker and Docker Compose
- Redis running locally on port 6379

### 1. Create a Python environment

From the `bookclub/` directory:

```bash
python3.12 -m venv .venv
source .venv/bin/activate

pip install -r requirements/django.txt
```

### 2. Configure environment variables

Create a `.env` file inside `bookclub/`:

```dotenv
DJANGO_SECRET_KEY=replace-with-a-local-development-secret
DEV_DATABASE_URL=postgresql://bookclub:bookclub@localhost:5432/bookclub
```

The development settings are selected by default when using `manage.py`.

### 3. Start PostgreSQL and Redis

Start the PostgreSQL container:

```bash
docker compose up -d
```

The Compose configuration uses PostgreSQL 17 with the pgvector extension available.

Redis is configured separately for local development. Start a local Redis instance on port 6379, for example:

```bash
docker run --rm -p 6379:6379 redis:7
```

In development, Redis is used for Celery messaging and application caching.

### 4. Apply migrations and start Django

```bash
python manage.py migrate
python manage.py runserver
```

The Django API is available at:

`http://localhost:8000`

Migrations initialize the database schema but do not populate the book catalog. The existing book dataset requires a separate data import.

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

Some endpoints require authentication. State-changing requests use session-based authentication with CSRF protection.

Semantic search relies on the separate FastAPI embedding service, which must be running for those features to work locally.

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
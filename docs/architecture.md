# BookClub architecture

Start with the component or flow relevant to your change. This guide describes
behavior verified in source. Follow the links to check current behavior. The root
README has [system and CI/CD diagrams](../README.md#architecture) and
[AI design history](../README.md#ai-journey).

## Component map

| Component | Responsibility and entry points |
|---|---|
| React and Vite | [main.tsx](../frontend/src/main.tsx) mounts the router and auth provider. [App.tsx](../frontend/src/App.tsx) defines page routes. Domain API modules share [`apiFetch`](../frontend/src/api/client.ts). See the [frontend setup](../frontend/README.md). |
| Django and library | [Project URLs](../bookclub/mysite/urls.py) delegate to [library URLs](../bookclub/library/urls.py). The library handles the catalog, accounts, reviews, and lists. See its [views](../bookclub/library/views.py), [serializers](../bookclub/library/serializers.py), and [models](../bookclub/library/models.py). |
| AI and FastAPI | Django's AI app handles [summaries and embeddings](../bookclub/ai/models.py), [recommendations](../bookclub/ai/services/recommendations.py), and [catalog enrichment commands](../bookclub/ai/management/commands/). The separate [FastAPI app](../bookclub/ai_service/app.py) serves query embeddings to Django. |
| PostgreSQL | Stores library and AI data. Local [Compose](../bookclub/docker-compose.yml) uses PostgreSQL 17 with pgvector. Migrations enable [`pg_trgm`](../bookclub/library/migrations/0006_enable_trigram.py) and [`vector`](../bookclub/library/migrations/0007_enable_pgvector.py). |
| Background work | [Celery](../bookclub/mysite/celery.py) discovers [library tasks](../bookclub/library/tasks.py) for welcome email and homepage refresh. See the [environment settings](#configuration-and-deployment) for cache, broker, and beat configuration. |
| Delivery | [GitHub Actions](../.github/workflows/ci.yml) validates and packages the app. [Terraform](../infra/) defines AWS resources. [terraform-bootstrap](../terraform-bootstrap/main.tf) defines remote-state storage. See the [deployment boundary](#configuration-and-deployment). |

## Authentication and CSRF

- **Frontend.** [`AuthProvider`](../frontend/src/context/AuthContext.tsx) reads
  session identity from `GET /api/me/`. The [auth API module](../frontend/src/api/auth.ts)
  calls login, signup, and logout. [`apiFetch`](../frontend/src/api/client.ts)
  includes cookies, fetches a masked token from `GET /api/csrf/` as needed, and
  sends `X-CSRFToken` on unsafe requests. It clears the cached token on a `403`.
  The caller decides whether to resubmit. The auth module clears the token
  after successful login, signup, and logout.
- **Django views.** The [library routes](../bookclub/library/urls.py) resolve to
  [`CSRFAPIView`, `LoginAPIView`, `SignupAPIView`, `LogoutAPIView`, and `MeAPIView`](../bookclub/library/views.py).
  Token bootstrap ensures a CSRF cookie. Login and signup establish a Django
  session. Signup creates system lists and queues the welcome task after commit.
  Django validates CSRF on login and signup before either handler runs.
  Both endpoints allow anonymous callers and rotate the CSRF cookie on success.
- **Settings and tests.** [Base settings](../bookclub/mysite/settings/base.py)
  configure credentialed CORS and Django's CSRF middleware.
  [Development](../bookclub/mysite/settings/development.py) allows credentialed
  CORS and trusts CSRF requests from the frontend at `http://localhost:5173`.
  [Production](../bookclub/mysite/settings/production.py) uses explicit origin
  lists and secure `SameSite=None` session and CSRF cookies.
  [`AuthCSRFTests`](../bookclub/library/tests/test_auth_csrf.py) cover rejected requests,
  session identity, token rotation, system lists, and deferred welcome email.
  Use the [isolated suite](#validation) to check endpoint regressions.

## Search and AI

- **Keyword search.** [`searchAll`](../frontend/src/api/search.ts) sends
  `GET /api/search/` to [`SearchBooksAPIView`](../bookclub/library/search_views.py).
  Django ranks books with PostgreSQL full-text search and trigram similarity.
- **Semantic search.** [SemanticDiscovery](../frontend/src/components/SemanticDiscovery/SemanticDiscovery.tsx)
  calls [`semanticSearch`](../frontend/src/api/search.ts), which sends
  `GET /api/search/semantic/` to [`SemanticSearchAPIView`](../bookclub/library/search_views.py).
  The view accepts an integer `limit` from 1 to 50 and defaults to 10.
  [`SemanticSearchService.search`](../bookclub/ai/services/semantic_search.py)
  calls [`AIClient.embed_query`](../bookclub/ai/services/ai_client.py).
  The client sends the text to [FastAPI's `POST /embed`](../bookclub/ai_service/app.py)
  at `AI_SERVICE_URL`. Django ranks [`BookEmbedding`](../bookclub/ai/models.py)
  rows by cosine distance, using `summary_no_title` by default. The schema
  stores 384-dimensional vectors and defines an
  [HNSW cosine index](../bookclub/ai/migrations/0005_bookembedding_book_embedding_hnsw_cosine.py).
  Use a query plan to confirm index use when tuning the index.
- **Stored vectors and tests.** [`generate_embeddings`](../bookclub/ai/management/commands/generate_embeddings.py)
  uses [`EmbeddingService`](../bookclub/ai/services/embeddings.py) to create
  stored vectors. Keep the query model compatible with those vectors.
  [`SearchTests`](../bookclub/library/tests/test_search.py) run PostgreSQL search with
  stubbed query embeddings.

## Configuration and deployment

| Environment | Configuration entry points |
|---|---|
| Frontend | [`apiFetch`](../frontend/src/api/client.ts) reads `VITE_API_URL` from Vite. Include `/api` in the URL. |
| Local Django | [manage.py](../bookclub/manage.py) defaults to [development settings](../bookclub/mysite/settings/development.py). [Base settings](../bookclub/mysite/settings/base.py) load `bookclub/.env` and read `DJANGO_SECRET_KEY` and `AI_SERVICE_URL`. Development reads `DEV_DATABASE_URL` and uses a separate local Redis instance for cache and Celery. See the [backend setup](../bookclub/README.md#setting-up-the-development-environment). |
| Production Django and Celery | [WSGI](../bookclub/mysite/wsgi.py), [ASGI](../bookclub/mysite/asgi.py), and [Celery](../bookclub/mysite/celery.py) default to [production settings](../bookclub/mysite/settings/production.py) unless `DJANGO_SETTINGS_MODULE` is already set. Production uses `DATABASE_URL` for PostgreSQL, `REDIS_URL` for cache, and `CELERY_QUEUE_URL` for the SQS broker. |
| FastAPI | The [AI image](../bookclub/Dockerfile.ai) sets `MODEL_PATH`. [FastAPI](../bookclub/ai_service/app.py) reads it to load the model. |
| Isolated tests | [Test Compose](../bookclub/docker-compose.test.yml) uses [test settings](../bookclub/mysite/settings/test.py) with disposable PostgreSQL, in-memory cache and mail backends, and an in-memory Celery broker. |

- **Verified in source.** The [release workflow](../.github/workflows/ci.yml)
  publishes changed Django and AI images to ECR, proposes a production overlay
  update in `bookclub-deployment`, and publishes the frontend to S3 with
  CloudFront invalidation. The [Django image](../bookclub/Dockerfile) binds to
  port 8000. The [AI image](../bookclub/Dockerfile.ai) binds to port 8001.
  See [`OperationalEndpointMiddleware`](../bookclub/mysite/middleware.py)
  and the [FastAPI app](../bookclub/ai_service/app.py) for health endpoints.
- **External and unverified.** Argo CD sync, workload manifests, external
  database provisioning, live settings, and resource state require separate
  evidence. The [root README diagrams](../README.md#architecture) show the
  AWS topology.
- **Proposed.** Cloud Run is a possible future target. It would need decisions
  about ports and probes, proxy and cookie policy, service connectivity, and
  where to run Celery workers and beat.

## Validation

See [AGENTS.md](../AGENTS.md#development-and-validation-commands) for commands
and the [backend test runbook](../bookclub/README.md#running-the-backend-tests)
for prerequisites and cleanup. The [test launcher](../bookclub/run_backend_tests.py)
uses [`stage_test_context.py`](../bookclub/stage_test_context.py) and
[test Compose](../bookclub/docker-compose.test.yml) to run Django's system
check and the [library](../bookclub/library/tests/) and [AI](../bookclub/ai/tests.py)
tests against disposable PostgreSQL.
[Launcher regressions](../bookclub/test_backend_launcher.py) use standard-library
mocks. The [CI workflow](../.github/workflows/ci.yml) runs the Django system
check, discovers the library tests with `python manage.py test library.tests -v 2`,
and runs frontend lint, typecheck, and build checks.

**Historical validation.** The completed
[backend testing plan](plans/backend-testing.md#validation-results) records prior
launcher and suite runs, including concurrency and cleanup results.

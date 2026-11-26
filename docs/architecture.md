# BookClub architecture

Start with the component or flow relevant to your change. The map and flows
describe behavior **verified in source**. Use the linked code and configuration
to confirm current behavior. The root README has the
[system and CI/CD diagrams](../README.md#architecture) and
[AI design history](../README.md#ai-journey).

## Component map

| Component | Responsibility and entry points |
|---|---|
| React and Vite | [main.tsx](../frontend/src/main.tsx) mounts the router and auth provider. [App.tsx](../frontend/src/App.tsx) maps pages to routes. Domain API modules share [`apiFetch`](../frontend/src/api/client.ts). See the [frontend setup](../frontend/README.md). |
| Django and library | [Project URLs](../bookclub/mysite/urls.py) delegate to [library URLs](../bookclub/library/urls.py). The library owns catalog, accounts, reviews, and lists through its [views](../bookclub/library/views.py), [serializers](../bookclub/library/serializers.py), and [models](../bookclub/library/models.py). |
| AI and FastAPI | Django's AI app owns [summaries and embeddings](../bookclub/ai/models.py), [recommendations](../bookclub/ai/services/recommendations.py), and [catalog enrichment commands](../bookclub/ai/management/commands/). The separate [FastAPI app](../bookclub/ai_service/app.py) serves query embeddings to Django. |
| PostgreSQL | Stores library and AI data. Local [Compose](../bookclub/docker-compose.yml) defines PostgreSQL 17 with pgvector. Migrations enable [`pg_trgm`](../bookclub/library/migrations/0006_enable_trigram.py) and [`vector`](../bookclub/library/migrations/0007_enable_pgvector.py). |
| Background work | [Celery](../bookclub/mysite/celery.py) discovers [library tasks](../bookclub/library/tasks.py) for welcome email and homepage refresh. See the [environment settings](#configuration-and-deployment) for cache, broker, and beat configuration. |
| Delivery | [GitHub Actions](../.github/workflows/ci.yml) validates and packages the app. [Terraform](../infra/) defines AWS resources, and [terraform-bootstrap](../terraform-bootstrap/main.tf) defines remote-state storage. See the [deployment boundary](#configuration-and-deployment). |

## Authentication and CSRF

- [`AuthProvider`](../frontend/src/context/AuthContext.tsx) reads session identity
  through `GET /api/me/`. The [auth API module](../frontend/src/api/auth.ts)
  calls login, signup, and logout. [`apiFetch`](../frontend/src/api/client.ts)
  includes cookies, fetches a masked token from `GET /api/csrf/` as needed,
  and sends `X-CSRFToken` on unsafe requests. It clears the cached token on
  a `403` and leaves any resubmission to the caller. The auth module clears
  it after successful login, signup, and logout.
- The [library routes](../bookclub/library/urls.py) resolve to
  [`CSRFAPIView`, `LoginAPIView`, `SignupAPIView`, `LogoutAPIView`, and `MeAPIView`](../bookclub/library/views.py).
  Token bootstrap ensures a CSRF cookie. Login and signup establish a Django
  session. Signup creates system lists and queues the welcome task after commit.
  Login and signup currently use `AllowAny` and have no explicit view-level
  CSRF decorator. For enforcement changes, inspect DRF's default session
  authentication and Django's CSRF middleware alongside the resolved views.
- [Base settings](../bookclub/mysite/settings/base.py) configure credentialed
  CORS and Django's CSRF middleware. [Development](../bookclub/mysite/settings/development.py)
  currently allows all CORS origins and has an explicit CSRF trusted origin.
  [Production](../bookclub/mysite/settings/production.py) uses explicit origin
  lists and secure `SameSite=None` session and CSRF cookies. The existing
  [`SignupTests`](../bookclub/library/tests.py) cover session identity, system
  lists, and deferred welcome email. Use the [isolated suite](#validation)
  for endpoint regressions.

## Search and AI

- Keyword searches go from [`searchAll`](../frontend/src/api/search.ts) to
  `GET /api/search/` and [`SearchBooksAPIView`](../bookclub/library/search_views.py).
  Django uses PostgreSQL full-text search and trigram similarity for book ranking.
- [SemanticDiscovery](../frontend/src/components/SemanticDiscovery/SemanticDiscovery.tsx)
  calls [`semanticSearch`](../frontend/src/api/search.ts), which sends
  `GET /api/search/semantic/` to [`SemanticSearchAPIView`](../bookclub/library/search_views.py).
  [`SemanticSearchService.search`](../bookclub/ai/services/semantic_search.py)
  calls [`AIClient.embed_query`](../bookclub/ai/services/ai_client.py), which sends
  text to [FastAPI `POST /embed`](../bookclub/ai_service/app.py) via `AI_SERVICE_URL`.
  Django then ranks [`BookEmbedding`](../bookclub/ai/models.py) rows by cosine
  distance, defaulting to `summary_no_title`. The schema stores 384-dimensional
  vectors and defines an [HNSW cosine index](../bookclub/ai/migrations/0005_bookembedding_book_embedding_hnsw_cosine.py).
  Confirm index use with a query plan when tuning it.
- Stored vectors are generated by [`generate_embeddings`](../bookclub/ai/management/commands/generate_embeddings.py)
  using [`EmbeddingService`](../bookclub/ai/services/embeddings.py).
  Keep the query model compatible with stored vectors. [`SearchTests`](../bookclub/library/tests.py)
  exercise real PostgreSQL search with stubbed query embeddings.

## Configuration and deployment

| Environment | Configuration entry points |
|---|---|
| Frontend | [`apiFetch`](../frontend/src/api/client.ts) reads Vite's `VITE_API_URL`. The URL includes `/api`. |
| Local Django | [manage.py](../bookclub/manage.py) defaults to [development settings](../bookclub/mysite/settings/development.py). [Base settings](../bookclub/mysite/settings/base.py) load `bookclub/.env` and read `DJANGO_SECRET_KEY` and `AI_SERVICE_URL`. Development reads `DEV_DATABASE_URL` and expects a separate local Redis instance for cache and Celery. See the [backend setup](../bookclub/README.md#setting-up-the-development-environment). |
| Production Django and Celery | [WSGI](../bookclub/mysite/wsgi.py), [ASGI](../bookclub/mysite/asgi.py), and [Celery](../bookclub/mysite/celery.py) default to [production settings](../bookclub/mysite/settings/production.py) unless `DJANGO_SETTINGS_MODULE` is already set. Production uses `DATABASE_URL`, `REDIS_URL` for caching, and `CELERY_QUEUE_URL` for the SQS broker. |
| FastAPI | [The AI image](../bookclub/Dockerfile.ai) sets `MODEL_PATH`, which the [FastAPI app](../bookclub/ai_service/app.py) reads when loading its model. |
| Isolated tests | [Test Compose](../bookclub/docker-compose.test.yml) selects [test settings](../bookclub/mysite/settings/test.py), with disposable PostgreSQL, local-memory cache and mail, and a memory-only Celery broker. |

- **Verified in source.** The [release workflow](../.github/workflows/ci.yml)
  publishes changed Django and AI images to ECR, proposes a production overlay
  update in `bookclub-deployment`, and publishes the frontend to S3 with
  CloudFront invalidation. The [Django image](../bookclub/Dockerfile) and
  [AI image](../bookclub/Dockerfile.ai) bind ports 8000 and 8001 respectively.
  Health endpoints live in [`OperationalEndpointMiddleware`](../bookclub/mysite/middleware.py)
  and the [FastAPI app](../bookclub/ai_service/app.py).
- **External and unverified.** Argo CD sync, workload manifests, external database
  provisioning, and live settings or resource state require separate evidence.
  The [root README diagrams](../README.md#architecture) describe the AWS topology.
- **Proposed.** Cloud Run is a possible future target. Its port and probe settings,
  proxy and cookie policy, service connectivity, and Celery worker and beat
  placement would need to be decided for that target.

## Validation

Use [AGENTS.md](../AGENTS.md#development-and-validation-commands) for commands
and the [backend test runbook](../bookclub/README.md#running-the-backend-tests)
for prerequisites and cleanup behavior. The
[`run_backend_tests.py` launcher](../bookclub/run_backend_tests.py) uses
[`stage_test_context.py`](../bookclub/stage_test_context.py) and
[test Compose](../bookclub/docker-compose.test.yml) to run Django's system
check and [library](../bookclub/library/tests.py) and [AI](../bookclub/ai/tests.py)
tests against disposable PostgreSQL. [Launcher regressions](../bookclub/test_backend_launcher.py)
run with standard-library mocks. The [CI workflow](../.github/workflows/ci.yml)
runs the Django system check and frontend lint, typecheck, and build checks.

**Historical validation.** The completed
[backend testing plan](plans/backend-testing.md#validation-results) records prior
launcher and suite runs, including concurrency and cleanup results.

# AGENTS.md

## Repository structure

- `frontend/` contains the React, TypeScript, and Vite app. Find routes in `src/App.tsx` and domain API calls in `src/api/`. The shared API client handles `VITE_API_URL`, session cookies, and CSRF.
- `bookclub/mysite/` configures Django, routing, and Celery. `bookclub/library/` handles the catalog, accounts, reviews, lists, search endpoints, and background tasks. `bookclub/ai/` handles AI data, recommendations, and catalog enrichment commands. `bookclub/ai_service/` runs the separate FastAPI query-embedding service.
- PostgreSQL provides full-text, trigram, and vector search. Local Compose uses PostgreSQL 17 with pgvector. Development requires a separate local Redis instance. Production uses Redis for caching and SQS for Celery.
- `infra/` and `terraform-bootstrap/` define AWS infrastructure and remote state. `.github/workflows/ci.yml` validates changes and publishes images and static assets. Argo CD watches the separate `bookclub-deployment` GitOps repository for backend deployments.

## Development and validation commands

| Directory | Command | Purpose |
|---|---|---|
| `frontend/` | `npm ci` | Install locked dependencies. CI uses Node 22. |
| `frontend/` | `npm run dev` | Start Vite. Set `VITE_API_URL` to the intended API base, including `/api`. |
| `frontend/` | `npm run lint`, `npm run typecheck`, `npm run build` | Run frontend checks and build. |
| `bookclub/` | `pip install -r requirements/django.txt` | Install Django dependencies with Python 3.12. |
| `bookclub/` | `python manage.py check` | Run Django system checks. Match CI using the Backend Checks job's settings and environment variables with local or dummy values. |
| `bookclub/` | `python3 run_backend_tests.py` | Run Django checks and backend tests against disposable PostgreSQL. Requires a POSIX host, Python 3.9+, Git, and access to Docker with Compose (validated with v5.3.1). |
| `bookclub/` | `python3 -m unittest -v test_backend_launcher` | Test the launcher on a POSIX host with Python 3.9+. The tests use standard-library mocks and need neither Docker nor Django dependencies. |

CI builds and scans changed Django and FastAPI images. The frontend has no test script.

## Engineering rules

- **Writing.** Use simple, concise, and precise language. Prefer short sentences and direct instructions. Avoid repetition and unnecessary formality. Keep necessary technical terms. Link to details when needed.
- **Architecture context.** When architectural context is needed, consult the relevant section of [docs/architecture.md](docs/architecture.md).Verify behavior in source and expand the search when needed. Update the documentation when architecture changes.
- **Execution planning.** Follow [PLANS.md](PLANS.md) for when to create and how to maintain execution plans.
- **Scope and dependencies.** Keep changes focused and avoid unrelated refactoring. Prefer existing dependencies and project patterns. Obtain explicit approval before adding a significant dependency or making a significant architectural change.
- **Testing.** Run the relevant checks above. Use the test launcher to stage and verify the Docker build context and run containerized backend tests. Add focused regression tests for changes to authentication, permissions, database invariants, or API contracts. Use disposable PostgreSQL with the required extensions for database-backed tests. Stub OpenAI and embedding HTTP calls in automated tests.
- **Database and API compatibility.** Add Django migrations for model changes and handle existing rows. Preserve catalog import identity and uniqueness constraints for reviews and lists. Check frontend callers before changing request or response shapes, pagination, or session and CSRF behavior. Keep query embeddings compatible with stored vector dimensions and embedding types.
- **Git and deployment.** Do not commit, push, merge, create pull requests, or trigger deployments unless explicitly requested. Obtain explicit authorization before applying or destroying Terraform, running production migrations, changing AWS or Kubernetes resources, publishing images or assets, or updating the GitOps repository. Treat cluster manifests in the separate repository as unverified unless inspected.
- **External services and secrets.** Use local stubs and dummy settings by default. Obtain explicit authorization before contacting live OpenAI, database, AWS, or other external service endpoints. Keep secret values out of source, commits, logs, fixtures, and reports. Refer to configuration by environment variable or secret name.
- **Reporting.** Summarize affected components and any migration or deployment implications. List the exact commands and results. Explain skipped checks. Distinguish source inspection, local validation, and live verification.

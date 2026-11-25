# AGENTS.md

## Repository structure and existing conventions

- `frontend/` is the React, TypeScript, and Vite app. Routes live in `src/App.tsx`. Domain API calls live in `src/api/` and share a client for `VITE_API_URL`, session cookies, and CSRF.
- `bookclub/mysite/` configures Django, routing, and Celery. `bookclub/library/` owns the catalog, accounts, reviews, lists, search endpoints, and background tasks. `bookclub/ai/` owns AI data, recommendation logic, and catalog enrichment commands. `bookclub/ai_service/` is the separate FastAPI query-embedding service.
- PostgreSQL provides full-text, trigram, and vector search. Local Compose defines PostgreSQL 17 with pgvector. Development settings expect a separate local Redis instance. Production uses Redis for caching and SQS for Celery.
- `infra/` and `terraform-bootstrap/` define AWS infrastructure and remote state. `.github/workflows/ci.yml` validates changes and publishes images and static assets. Backend deployment goes through the separate `bookclub-deployment` GitOps repository, which Argo CD watches.

## Development and validation commands

| Directory | Command | Purpose |
|---|---|---|
| `frontend/` | `npm ci` | Install locked dependencies. CI uses Node 22. |
| `frontend/` | `npm run dev` | Start Vite. Set `VITE_API_URL` to the intended API base, including `/api`. |
| `frontend/` | `npm run lint`, `npm run typecheck`, `npm run build` | Run frontend checks and build. |
| `bookclub/` | `pip install -r requirements/django.txt` | Install Django dependencies in a Python 3.12 environment. |
| `bookclub/` | `python manage.py check` | Run Django system checks. For CI parity, use the settings and environment variables from the workflow’s Backend Checks job with local or dummy values. |

CI builds and scans changed Django and FastAPI images. The checked-in Django test modules are placeholders, and the frontend has no test script.

## Engineering rules

- **Scope and dependencies.** Keep changes focused and avoid unrelated refactoring. Prefer existing dependencies and project patterns. Obtain explicit approval before adding a significant dependency or making a significant architectural change.
- **Testing.** Run the relevant checks above. Add focused regression coverage for changes to authentication, permissions, database invariants, or API contracts. Use disposable PostgreSQL with the required extensions for database-backed tests. Stub OpenAI and embedding HTTP calls in automated tests.
- **Database and API compatibility.** Add Django migrations for model changes and account for existing rows. Preserve catalog import identity and review and list uniqueness constraints. Check frontend callers before changing request or response shapes, pagination, or session and CSRF behavior. Keep query embeddings compatible with stored vector dimensions and embedding types.
- **Git and deployment.** Do not commit, push, merge, create pull requests, or trigger deployments unless explicitly requested. Obtain explicit authorization before applying or destroying Terraform, running production migrations, changing AWS or Kubernetes resources, publishing images or assets, or updating the GitOps repository. Treat cluster manifests in the separate repository as unverified unless inspected.
- **External services and secrets.** Use local stubs and dummy settings by default. Obtain explicit authorization before contacting live OpenAI, database, AWS, or other external service endpoints. Keep secret values out of source, commits, logs, fixtures, and reports. Document configuration by environment variable or secret name.
- **Reporting.** Summarize the affected components and any migration or deployment implications. List the exact commands run and their outcomes, and explain any skipped checks. Distinguish source inspection, local validation, and live verification.
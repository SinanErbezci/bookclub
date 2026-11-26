# Backend testing foundation

**Status:** Implementation and validation complete. The independent reviewer approved the foundation after the launcher cleanup and exit-status fix. CI integration remains a separate task.

## Objective and scope

Provide a repeatable local command that runs a small Django backend suite against disposable PostgreSQL. Cover account setup, review behavior, keyword and semantic search, and the OpenAI summary adapter. Update this execution plan as work proceeds with milestone status, dated decisions and discoveries, and actual commands and outcomes.

## Context and existing architecture

- Django and Django REST Framework already provide the test runner, database test cases, and an API client. The `library` and `ai` test modules are placeholders. The backend Dockerfile and CI use Python 3.12 and `bookclub/requirements/django.txt`.
- Development Compose publishes PostgreSQL 17 with pgvector on port 5432 and persists its data. Development settings read `DEV_DATABASE_URL` and use Redis. Production settings read `DATABASE_URL` and use Redis and SQS. Base settings load a local dotenv file.
- The existing migrations install `pg_trgm` and `vector`. Keyword search uses PostgreSQL full-text and trigram queries. Semantic search uses 384-dimensional vectors and calls the embedding service for query vectors.
- The GitHub Actions backend job installs Django dependencies and runs `manage.py check` with production settings.

## Requirements and non-goals

- Use existing Django and DRF tools and Python's `unittest.mock`. Use a fresh test database with real migrations and PostgreSQL extensions.
- Keep test execution isolated from production databases and external services. Mock OpenAI, query embeddings, and task enqueueing at their boundaries.
- Verify the Docker build context excludes sensitive environment files, credentials, and production backups before building. Inspect filenames and ignore rules only. Keep secret values out of logs and the plan.
- Preserve existing application behavior and production infrastructure. Keep CI integration for a separate task. Record unrelated bugs in a separate follow-up list or issue and reference it here without including fixes in this work.

## Implementation milestones

1. **Verify the build context and establish isolation.** Audit filenames and effective Docker ignore rules. The launcher creates a private directory and uses `bookclub/stage_test_context.py` to stage and verify the source manifest by filename, size, and checksum. It checks the resolved Compose build context and Dockerfile before building. Compose provisions a dedicated test build and PostgreSQL 17 with pgvector on an internal network with no published ports or host mounts, temporary database storage, and a database readiness check.
2. **Configure Django's test settings.** Add `bookclub/mysite/settings/test.py` derived from base settings. Require the test service marker before importing base settings, disable dotenv loading, and use a dummy secret and fixed test-only database host, credentials, and Django test database name. Use local-memory cache and mail, a memory-only Celery broker with no external result backend, and test-only AI settings. Keep migrations enabled and grant the disposable database role the privileges needed for Django's create/drop lifecycle and extension installation.
3. **Add the first tests.** In `library/tests.py`, exercise signup and session identity through `/api/me/`, verify both system lists, and use Django's commit-callback capture to assert one mocked welcome-email task enqueue. Exercise review creation and rating/count updates, duplicate rejection and cross-user edit denial, plus the database uniqueness constraint through the ORM. Exercise keyword search with matching and unrelated books and semantic ordering with two known nonzero 384-dimensional vectors and a mocked `AIClient.embed_query`. In `ai/tests.py`, use `SimpleTestCase` and inject a mock SDK client to verify summary and token-usage mapping. Use small synthetic fixtures.
4. **Document and validate.** Add local setup and cleanup instructions to `bookclub/README.md`. Have the test service run `python manage.py check` followed by `python manage.py test --noinput` with test settings and propagate failures. From `bookclub/`, run the following commands with Docker Compose available.

   ```bash
   python3 run_backend_tests.py
   ```

   Inspect the service network, ports, and environment. Repeat the launcher with dummy database URLs, AI credentials, and a stale context variable exported in the host shell. Verify overlapping runs and cleanup after normal completion, failure, and a handled signal. The initial image build may require registry and package access.

## Acceptance criteria

- A clean run creates the Django test database, applies migrations, makes both PostgreSQL extensions available, and passes the system check and representative suite. Cleanup removes the disposable services and database storage.
- The effective build context audit confirms sensitive files and production backups are excluded. The resolved configuration confirms an internal network, zero published ports, and test-only settings even with dummy production-style variables in the host shell.
- Tests exercise real database constraints and search queries while OpenAI, query embeddings, and email enqueueing use local substitutes or mocks.
- Existing behavior and production infrastructure are preserved, CI remains outside the change, and unrelated bugs are tracked separately. This plan records actual validation and outstanding blockers.

## Progress checklist

- [x] Inspect backend settings, dependencies, database configuration, models, test modules, Compose, and CI.
- [x] Record the reviewed plan and its implementation constraints.
- [x] Audit build context filenames and configure isolated Compose services.
- [x] Add dedicated test settings.
- [x] Verify Docker build exclusions and the database and migration lifecycle.
- [x] Add the representative suite.
- [x] Document local commands.
- [x] Record full runtime validation results.
- [x] Address independent review findings and repeat launcher validation.
- [x] Record final independent review approval and update `AGENTS.md` with the verified testing commands.

## Decision log

| Decision | Rationale |
| --- | --- |
| Use Django, DRF, and standard-library mocks | The existing dependencies cover the first suite. |
| Containerize both Django and PostgreSQL for testing | The internal network and disposable database support real PostgreSQL behavior and service isolation. This requires working Docker Compose and an initial image build. |
| Run the normal migration chain | A fresh run checks extension installation, schema creation, and database constraints together. |
| Defer CI integration | Local execution and validation are the scope of this task. |
| 2026-11-25 · Use a test-only Dockerfile | The test image uses the same Python base and requirements. The original Dockerfile-specific ignore rules were superseded by explicit staging after the failed build-context audit. |
| 2026-11-25 · Stage the build context explicitly | Removing the broad directory exceptions excluded both synthetic sensitive fixtures. A fresh source-only directory gives a reviewable manifest and keeps the full checkout outside the build context regardless of Docker ignore behavior. The production Dockerfile and ignore file are unchanged. |
| 2026-11-25 · Couple staging, execution, and cleanup | The review identified that separate manual steps could accept stale context and collide on a fixed project name. The launcher overrides the inherited path, verifies the staged contents and resolved Compose build, and allocates a unique project. Cleanup targets that project's containers, network, volumes, generated test image, and staging directory. Cleanup errors are reported separately from the run status. |
| 2026-11-25 · Strengthen behavior checks | The review identified that signup did not prove deferred enqueueing, one vector query could pass with ID order, and the keyword test covered only a prefix. Signup now verifies exactly one pending callback and one post-callback enqueue. Two query vectors require opposite rankings. A non-prefix whole word and a transposition exercise full-text and trigram matching. |
| 2026-11-25 · Determine exit status after cleanup | Re-review found that returning from the execution block fixed the result before cleanup ran. The launcher now attempts both cleanup operations with handlers active, reports failures individually, and then gives precedence to an existing test failure, a handled signal, and cleanup failure, in that order. |

## Discoveries and blockers

- Docker Desktop integration was unavailable during planning. Authorized local Docker access resolved that blocker during implementation.
- 2026-11-25 · Filename and ignore-rule audit found root and nested dotenv files and local Terraform state inside the backend context. Repository-root credentials and backup files are outside that context. The test allowlist admits Python source in the three Django packages, two email templates, the entry point, and Django requirements. The Python source audit found no untracked files or symlinks in the context. Docker-level checks are tracked below.
- 2026-11-25 · The first BuildKit run transferred 567.41 MB, then was interrupted before copying the source or running exclusion assertions. The original Compose config selected the full backend checkout and `Dockerfile.test`. A scratch build reproduced the ignore failure with empty fixtures. The negated directory rules re-included descendants, including a mock batch file and a nested `.env`. The final hidden-directory pattern did not exclude the nested dotenv file. The root dotenv fixture was excluded. This establishes the rule failure without inspecting secret contents. The exact contents of the earlier transfer were not verified.
- 2026-11-25 · The selected builder was `default`, using the `docker` driver and the local Docker Desktop daemon through `unix:///var/run/docker.sock`. The recovery leaves existing images and builder caches in place.
- Record unrelated application bugs separately if discovered during implementation and link the follow-up here.
- 2026-11-25 · WhiteNoise emitted a warning because the test image does not contain collected static assets. The API-only suite passed, and no unrelated application changes were needed.
- 2026-11-25 · Launcher host minimum is Python 3.9 on POSIX. Validation used Python 3.12.3, Compose v5.3.1, and Docker Desktop BuildKit v0.31.2. The Python base tag resolved to `sha256:191083cdf6c7bda8c76158983163ead5d5cf7b77cf3033e805bb0f5296f51b4b`. The database reported PostgreSQL 17.10. Direct pins are in `bookclub/requirements/django.txt`. The observed initial dependency install resolved unpinned `httpx` to 0.28.1. Image tags and unpinned dependencies can move.
- 2026-11-25 · The launcher handles SIGINT, SIGTERM, and SIGHUP. SIGKILL, a host crash, or an unavailable Docker daemon can interrupt cleanup. The launcher prints the unique project name and staged path for diagnosis.
- 2026-11-25 · The local database image digest was `pgvector/pgvector@sha256:d2ef61f42ef767baa5a1475393303cc235bcd92febd9d7014eddb48b41f3bad0`.

## Validation results

| Stage | Command or check | Outcome |
| --- | --- | --- |
| Planning | Source inspection | Confirmed existing database dependencies, extension migrations, placeholder tests, and CI's system check. |
| Planning | `docker compose version` | Docker reported that integration was unavailable in this WSL distro. |
| Before saving the plan | `git status --short` | Clean worktree. |
| 2026-11-25 | `docker compose version` | Compose v5.3.1 is now available. |
| 2026-11-25 | `docker image ls --format '{{.Repository}}:{{.Tag}}'` | Daemon access denied in the sandbox, then succeeded with authorization. PostgreSQL 17 with pgvector is available locally. |
| 2026-11-25 | `docker compose -p bookclub-test -f docker-compose.test.yml config` | Resolved both services on the sole internal network, with no published ports. |
| 2026-11-25 | `docker compose -p bookclub-test -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests` | Interrupted with exit 130 after an oversized context transfer to the local builder. The Django checks, fresh database suite, and dummy-environment repeat did not run. |
| 2026-11-25 | `docker context show`, `docker context inspect --format '{{.Endpoints.docker.Host}}'`, and authorized `docker buildx inspect` | Confirmed the selected builder uses the local Docker Desktop daemon. |
| 2026-11-25 | `docker buildx build` with the old rules, a scratch Dockerfile, and empty fixtures | The exported manifest included the nested dotenv fixture and mock batch file, confirming the original rule behavior. |
| 2026-11-25 | Repeat the synthetic `docker buildx build` with negated directory rules removed | The exported manifest contained only the approved Python fixture. |
| 2026-11-25 | `python3 bookclub/stage_test_context.py /tmp/bookclub-test-context.ojf5dd` and independent filename/size inspection | Verified 97 files and 167,263 bytes before the rebuild. No hidden files, symlinks, batch JSONL, state files, or backup filenames. |
| 2026-11-25 | `env -u BOOKCLUB_TEST_CONTEXT docker compose -p bookclub-test -f docker-compose.test.yml config --quiet` | Compose rejected the missing context before running a build. With the verified context set, config validation passed. |
| 2026-11-25 | `docker compose -p bookclub-test -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests` with the verified context | BuildKit transferred 173.55 kB including protocol metadata. Exit 0. PostgreSQL 17.10 initialized, Django created and destroyed its test database, the system check reported zero issues, and all six tests passed. Keyword and vector search exercised both extensions. |
| 2026-11-25 | `docker compose -p bookclub-test -f docker-compose.test.yml down --volumes`, then `config --format json` and `up --no-build --abort-on-container-exit --exit-code-from tests` with dummy host database URLs and AI variables | Compose selected the same verified context and test-only environment. A new PostgreSQL cluster initialized, the system check passed, and all six tests passed again. Final `down --volumes` removed the two test containers and their internal network. |
| 2026-11-25 | `git diff --check` | Passed. |
| 2026-11-25 | Two concurrent `python3 bookclub/run_backend_tests.py` invocations, one with dummy database and AI variables and an inherited `BOOKCLUB_TEST_CONTEXT=/untrusted-inherited-context` | Both exited 0. Each verified 97 staged files, 168,226 bytes, under a distinct path and Compose project. BuildKit transferred 174.52 kB for each. Both system checks reported zero issues, and all eight tests passed in each run. |
| 2026-11-25 | Launcher tests with a stub Docker CLI | A mismatched resolved context exited 1 before `up`. A fake test exit 23 survived a cleanup exit 41, and cleanup failure was reported. A SIGTERM during `up` exited 143. All three removed their staging directories. |
| 2026-11-25 | Local Docker inspection after the two concurrent launches | Both PostgreSQL containers ran at the same time. After exit, filtered Docker listings confirmed no project-labeled containers, networks, volumes, or images remained. Both staging paths were gone. |
| 2026-11-25 | Local Docker inspection and SIGTERM during a third launcher invocation | The live test network was internal and the database had zero host port bindings. The launcher exited 143 and inspection again found no project resources or staging directory. |
| 2026-11-25 | `cd bookclub && python3 -m unittest -v test_backend_launcher` | All four local mock tests passed. They covered success followed by cleanup failure, SIGTERM during execution and cleanup, preservation of the existing test exit 23, and staging cleanup despite a Compose cleanup failure. |
| 2026-11-25 | `python3 bookclub/run_backend_tests.py` with the final launcher | Exit 0. Django's system check reported zero issues and all eight backend tests passed on disposable PostgreSQL. Compose removed the two project containers, the generated test image, and the network. A filesystem check confirmed removal of the staged directory. |

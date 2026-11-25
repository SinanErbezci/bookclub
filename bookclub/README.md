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

1. Clone the repository

```bash
git clone ...
```

2. Create `.env`

```bash
cp .env.example .env
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Start PostgreSQL

```bash
docker compose up -d
```

5. Restore the development database

```bash
docker cp bookclub.dump <container>:/tmp/bookclub.dump

docker compose exec db pg_restore \
    -U bookclub \
    -d bookclub \
    --clean \
    --if-exists \
    /tmp/bookclub.dump
```

If you want GPU acceleration on Windows/Linux, install the appropriate PyTorch build for your hardware using the official PyTorch installation guide.

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
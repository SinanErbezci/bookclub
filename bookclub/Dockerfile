# =========================
# Stage 1: Builder
# =========================
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Create an isolated Python environment for application dependencies.
RUN python -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

COPY requirements/django.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r django.txt


# =========================
# Stage 2: Runtime
# =========================
FROM python:3.12-slim AS runtime

RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy the prepared Python environment from the builder.
COPY --from=builder /opt/venv /opt/venv

# Remove packaging tools that aren't required at runtime.
RUN rm -rf \
    /opt/venv/lib/python3.12/site-packages/pip \
    /opt/venv/lib/python3.12/site-packages/pip-* \
    /usr/local/lib/python3.12/site-packages/pip \
    /usr/local/lib/python3.12/site-packages/pip-*

RUN groupadd --gid 10001 app && \
    useradd \
        --uid 10001 \
        --gid 10001 \
        --no-create-home \
        --shell /usr/sbin/nologin \
        app

COPY . .

USER 10001:10001

EXPOSE 8000

CMD ["gunicorn", "mysite.wsgi:application", "--bind", "0.0.0.0:8000"]
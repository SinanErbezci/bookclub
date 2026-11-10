import httpx

from django.conf import settings


class AIClient:
    def embed_query(self, query: str) -> list[float]:
        response = httpx.post(
            f"{settings.AI_SERVICE_URL}/embed",
            json={"text": query},
            timeout=10.0,
        )

        response.raise_for_status()

        return response.json()["embedding"]
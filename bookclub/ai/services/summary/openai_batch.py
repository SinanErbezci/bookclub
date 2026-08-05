from openai import OpenAI
from django.conf import settings


class OpenAIBatchService:

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured.")

        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
        )

    def upload_file(
        self,
        file_path: str,
    ):
        with open(file_path, "rb") as file:
            return self.client.files.create(
                file=file,
                purpose="batch",
            )

    def create_batch(
        self,
        *,
        input_file_id: str,
    ):
        return self.client.batches.create(
            input_file_id=input_file_id,
            endpoint="/v1/responses",
            completion_window="24h",
        )

    def retrieve_batch(
        self,
        *,
        batch_id: str,
    ):
        return self.client.batches.retrieve(batch_id)

    def download_file(
        self,
        *,
        file_id: str,
    ):
        return self.client.files.content(file_id)

import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)

class LibraryConfig(AppConfig):
    name = 'library'

    def ready(self):
        logger.info("CORS signal called for %s", request.path)
        import library.cors

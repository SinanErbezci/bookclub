import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)

class LibraryConfig(AppConfig):
    name = 'library'

    def ready(self):
        logger.info("LibraryConfig.ready() called")
        import library.cors

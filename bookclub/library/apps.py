from django.apps import AppConfig


class LibraryConfig(AppConfig):
    name = 'library'

    def ready(self):
        print(">>> LibraryConfig.ready()")
        import library.cors

from django.contrib import admin
from .models import (
    Author,
    Book,
    Genre,
    List,
    ListBook,
    Publisher,
    Review,
    Series,
    User,
)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "author",
        "publisher",
        "rating",
    )

    search_fields = (
        "title",
        "author__name",
        "isbn",
    )

    list_filter = (
        "publisher",
        "genres",
    )

    autocomplete_fields = (
        "author",
        "publisher",
        "series",
        "genres",
    )
# Register your models here.
@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    search_fields = ("name",)

@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    search_fields = ("name",)

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    search_fields = ("name",)

@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    search_fields = ("name",)

admin.site.register(User)
admin.site.register(Review)
admin.site.register(List)
admin.site.register(ListBook)
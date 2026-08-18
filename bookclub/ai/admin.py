from django.contrib import admin

from .models import BookEmbedding, BookSummary
# Register your models here.
# @admin.register()
# class ...Admin(admin.ModelAdmin):
#     list_display = (
#         "book",
#         "summary_status",
#         "embedding_status",
#         "updated_at",
#     )

#     list_filter = (
#         "summary_status",
#         "embedding_status",
#     )

#     search_fields = (
#         "book__title",
#         "book__author__name",
#     )

#     autocomplete_fields = ("book",)

#     readonly_fields = (
#         "created_at",
#         "updated_at",
#     )
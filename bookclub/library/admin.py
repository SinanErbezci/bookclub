from django.contrib import admin
from .models import Book,Author,User, Publisher, Series, Genres, Review,Lists, ListBooks
# Register your models here.

admin.site.register(Book)
admin.site.register(Author)
admin.site.register(User)
admin.site.register(Publisher)
admin.site.register(Series)
admin.site.register(Genres)
admin.site.register(Review)
admin.site.register(Lists)
admin.site.register(ListBooks)
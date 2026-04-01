from django.contrib import admin
from .models import Book,Author,User, Publisher, Series, Genre, Review,List, ListBook
# Register your models here.

admin.site.register(Book)
admin.site.register(Author)
admin.site.register(User)
admin.site.register(Publisher)
admin.site.register(Series)
admin.site.register(Genre)
admin.site.register(Review)
admin.site.register(List)
admin.site.register(ListBook)
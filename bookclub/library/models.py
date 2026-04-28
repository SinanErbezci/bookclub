from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator, MaxLengthValidator, MinLengthValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
# Create your models here.

class User(AbstractUser):
    MALE = "M"
    FEMALE = "F"
    OTHER = "O"

    GENDER_CHOICES = [
        (MALE, "Male"),
        (FEMALE, "Female"),
        (OTHER, "Other")
    ]

    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    

class Author(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Series(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name
    
class Publisher(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name
    

class Book(models.Model):
    source = models.CharField(max_length=50)
    source_row_id = models.TextField()

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    pub_date = models.DateField(null=True, blank=True)
    author = models.ForeignKey(Author, related_name='books', on_delete=models.CASCADE)
    pages = models.IntegerField(blank=True, null=True)
    series = models.ForeignKey(Series,blank=True,null=True, on_delete=models.SET_NULL, related_name='books')
    series_num = models.IntegerField(blank=True, null=True)
    genres = models.ManyToManyField(Genre, blank=True, related_name='books')
    publisher = models.ForeignKey(Publisher, blank=True, null=True, on_delete=models.SET_NULL, related_name='books')
    cover = models.URLField(blank=True, null=True)
    num_ratings = models.IntegerField(default=0)
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=Decimal("0.0"),
        validators=[
            MinValueValidator(Decimal("0.0")),
            MaxValueValidator(Decimal("5.0")),
    ])

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["author"]),
            models.Index(fields=["-rating"]),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["source", "source_row_id"],
                name = "uniq_book_source_row"
            )
        ]

class Review(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    rating = models.SmallIntegerField(validators=[
        MaxValueValidator(5), MinValueValidator(1)
    ])
    text = models.TextField(validators=[MaxLengthValidator(2000), MinLengthValidator(10)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["book", "-created_at"])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["book", "user"],
                name= "uniq_review_book_user"
            )
        ]
        ordering = ["-created_at"]

class UserFollower(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE , related_name="following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    class Meta:
        constraints  = [
            models.UniqueConstraint(
                fields=["follower", "following"],
                name = "uniq_user_follow"
            ),
            models.CheckConstraint(
                # in sql -> NOT (follower_id = following_id)
                condition=~models.Q(follower=models.F("following")),
                name="prevent_self_follow"
            ),
        ]

    def clean(self):
        if self.follower == self.following:
            raise ValidationError("Users cannot follow themselves")


class List(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lists")
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"],
                name="uniq_list_owner_name"
            )
        ]

        ordering = ["-created_at"]
class ListBook(models.Model):
    book_list = models.ForeignKey(List, on_delete=models.CASCADE, related_name="list_books")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="in_lists")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["book_list", "book"],
                name="uniq_book_list"
            )
        ]
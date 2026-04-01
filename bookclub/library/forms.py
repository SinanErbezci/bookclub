from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User 

class CreateUserFrom(UserCreationForm):
    template_name = "library/form_snippet.html"
    class Meta:
        model = User
        fields = ("username", "password1", "password2", "email")

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for StudyBuddy.
    Safe, extendable, production-ready.
    """

    # Make email unique (VERY useful later)
    email = models.EmailField(unique=True)

    # Optional future-proof fields
    is_verified = models.BooleanField(default=False)

    # Example role system (simple but powerful)
    is_student = models.BooleanField(default=True)
    is_teacher = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


    def __str__(self):
        return self.email
    
# We need to make migrations tomorrow

from django.db import models

from django.contrib.auth.models import User
from django.db import models

class CanvasState(models.Model):
    title = models.CharField(max_length=100, default='Untitled')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    state = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CanvasState for user {self.user.username}"

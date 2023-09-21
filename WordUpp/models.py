from django.db import models

# Create your models here.
# from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.db import models  # Import this at the top of your models.py if you haven't already

class Canvas(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='Untitled Canvas')


    user_text = models.TextField()
    text_color = models.CharField(max_length=7)
    bg_color = models.CharField(max_length=7)
    word_objects = models.JSONField(default=list)  # or default=dict
    horizontal_slider_value = models.IntegerField(null=True, blank=True)
    vertical_slider_value = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name or 'Untitled Canvas'
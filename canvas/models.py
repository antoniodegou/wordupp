from django.db import models
from django.contrib.auth.models import User
from subscription.models import UserSubscription

class DownloadLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    download_date = models.DateTimeField(auto_now_add=True)

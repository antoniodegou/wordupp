from django.contrib import admin

# Register your models here.
from .models import DownloadLog

admin.site.register(DownloadLog)
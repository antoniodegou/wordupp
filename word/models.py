from django.db import models
from django.shortcuts import render

def canvas_view(request):
    return render(request, 'canvas.html')

from django.urls import path
from . import views

urlpatterns = [
    path('canvas/', views.canvas_view, name='canvas'),
]
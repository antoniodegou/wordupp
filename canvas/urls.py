from django.urls import path 
from . import views
 
urlpatterns = [
    path('canvas/', views.canvas, name='canvas'),
    path('handle_download/', views.handle_download, name='handle_download'),  
]
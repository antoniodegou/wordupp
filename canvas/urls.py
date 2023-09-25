from django.urls import path 
from . import views
 

# app_name = 'core'


urlpatterns = [
    path('canvas/', views.canvas, name='canvas'),
    path('handle_download/', views.handle_download, name='handle_download'),  # Add this line

]
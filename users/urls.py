from django.urls import path 
from . import views
 

# app_name = 'core'


urlpatterns = [
    # path('register/', views.register, name='register'),
    # path('login/', views.login, name='login'),      
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('logout/', views.user_logout, name='logout'),
]
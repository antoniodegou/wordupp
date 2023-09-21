from django.urls import path
from . import views

urlpatterns = [
    path('subscribe_free/', views.subscribe_free, name='subscribe_free'),
    path('subscribe_premium/', views.subscribe_premium, name='subscribe_premium'),
    path('upgrade/', views.upgrade_subscription, name='upgrade_subscription'),
    path('downgrade/', views.downgrade_subscription, name='downgrade_subscription'),
    path('customer_portal/', views.customer_portal, name='customer_portal'),

]
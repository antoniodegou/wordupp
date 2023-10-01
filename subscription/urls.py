from django.urls import path
from . import views

urlpatterns = [
    path('subscribe_premium/', views.subscribe_premium, name='subscribe_premium'),
    path('cancel/', views.cancel_subscription, name='cancel_subscription'),
    path('customer_portal/', views.customer_portal, name='customer_portal'),
    path('webhook/', views.stripe_webhook, name='stripe_webhook'),
    path('customer_portal/', views.customer_portal, name='customer_portal'),
    path('subscribe_premium/', views.subscribe_premium, name='subscribe_premium'),
]
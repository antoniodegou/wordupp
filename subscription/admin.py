from django.contrib import admin

# Register your models here.
from .models import SubscriptionPlan, UserSubscription, MyStripeEventModel

admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(MyStripeEventModel)
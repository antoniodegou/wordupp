from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta

def get_default_plan():
    return SubscriptionPlan.objects.get_or_create(name="WordUpp Free")[0].id



class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    duration = models.DurationField(default=timedelta(days=30))
    stripe_plan_id = models.CharField(max_length=255, null=True, blank=True)  # New field
 

    def __str__(self):
        return self.name

class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, default=get_default_plan)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=50, null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.user.username}'s {self.plan.name if self.plan else 'No'} subscription"

# New model for Stripe events
class MyStripeEventModel(models.Model):
    stripe_event_id = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=255)
    processed_at = models.DateTimeField(auto_now_add=True)
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import SubscriptionPlan, UserSubscription
from datetime import datetime, timedelta
import stripe
from django.conf import settings
from django.contrib import messages  # Don't forget to add this at the top
from django.urls import reverse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import stripe
from .models import UserSubscription, SubscriptionPlan  # Replace with your actual import
from django.contrib.auth.models import User
from datetime import datetime
from django.db import transaction
from .models import UserSubscription, MyStripeEventModel  # Add the new model here
from django.http import JsonResponse




# views.py
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
 
from .models import UserSubscription, MyStripeEventModel  # Add the new model here
 
from datetime import datetime
from django.http import JsonResponse, HttpResponseForbidden

stripe.api_key = settings.STRIPE_SECRET_KEY
 
print("Stripe API Key:", stripe.api_key)
from django.urls import reverse

 

 
@login_required
def subscribe_premium(request):
    if not request.user.is_authenticated:
        return HttpResponseForbidden("You need to be logged in to do that, darlin'!")
    try:
        stripe_customer = stripe.Customer.create(
            email=request.user.email,
            metadata={
                'username': request.user.username
            }
        )


        # Save the Stripe customer ID to your UserSubscription model
        user_subscription, created = UserSubscription.objects.get_or_create(
            user=request.user,
            defaults={
                'stripe_customer_id': stripe_customer.id,
                'start_date': datetime.now()  # Set the start_date here
            }
        )
        if not created:
            user_subscription.stripe_customer_id = stripe_customer.id
            user_subscription.save()

        # Fetch the premium plan
        premium_plan = SubscriptionPlan.objects.get(name='WordUpp Premium')

        # Create Stripe Checkout Session
        session = stripe.checkout.Session.create(
            customer=stripe_customer.id,
            payment_method_types=['card'],
            line_items=[{
                'price': premium_plan.stripe_plan_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url='http://localhost:8000/dashboard/?subscription=success',
            cancel_url='http://localhost:8000/dashboard/?subscription=cancel',
            metadata={
                'username': request.user.username
            }
        )

        subscription_status = request.GET.get('subscription')

        if subscription_status == 'success':
            messages.success(request, 'Yeehaw! Your subscription was successful, darlin\'!')
        elif subscription_status == 'cancel':
            messages.warning(request, 'Aw, shucks. Looks like you canceled the subscription.')
  
        # Return a JSON response instead of redirecting
        return JsonResponse({
            'session_id': session.id,
            'stripe_public_key': settings.STRIPE_PUBLIC_KEY
        })

    except SubscriptionPlan.DoesNotExist:
        messages.error(request, 'Well, shoot! Looks like the premium plan doesn\'t exist.')
        return JsonResponse({'error': 'Premium plan does not exist'})

    except stripe.error.StripeError as e:
        messages.error(request, f'Oh, sugar! Something went wrong: {str(e)}')
        return JsonResponse({'error': f'Stripe error: {str(e)}'})





 
@login_required
def cancel_subscription(request):
    try:
        # Fetch the user's current subscription
        user_sub = UserSubscription.objects.get(user=request.user)

        # If the user doesn't have a plan, they're already canceled
        if user_sub.plan is None:
            messages.info(request, 'You don\'t have an active subscription, sugar!')
            return redirect('dashboard')

        # Cancel the Stripe subscription
        if user_sub.stripe_subscription_id:
            stripe.Subscription.delete(user_sub.stripe_subscription_id)

        # Update the user's subscription record in the database
        user_sub.plan = None
        user_sub.end_date = datetime.now().date()  # Or set this to None, depending on your needs
        user_sub.stripe_subscription_id = None
        user_sub.save()

        messages.success(request, 'Your subscription has been canceled, darlin\'!')

    except UserSubscription.DoesNotExist:
        messages.error(request, 'Your subscription\'s gone missing, like a needle in a haystack!')
    except stripe.error.StripeError as e:
        messages.error(request, f'Oh, sugar! Something went wrong with Stripe: {str(e)}')

    return redirect('dashboard')



@login_required
def customer_portal(request):
    try:
        stripe_customer_id = request.user.subscription.stripe_customer_id
        if not stripe_customer_id:
            messages.warning(request, 'You don\'t have an active premium subscription to manage, sugar!')
            return redirect('dashboard')

        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=request.build_absolute_uri(reverse('dashboard')),
        )
        return redirect(session.url)

    except Exception as e:
        messages.error(request, f'Oh, sugar! Something went wrong: {str(e)}')
        return redirect('dashboard')
    



@transaction.atomic  # Makes sure all DB operations are atomic
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    # Check if this event was already processed
    stripe_event_id = event['id']
    if MyStripeEventModel.objects.filter(stripe_event_id=stripe_event_id).exists():
        return HttpResponse(status=200)  # Already processed this event

    # Handle the event
    if event['type'] == 'customer.subscription.updated':
        stripe_subscription_id = event['data']['object']['id']

        try:
            user_subscription = UserSubscription.objects.get(stripe_subscription_id=stripe_subscription_id)

            # Update the end date
            end_date_timestamp = event['data']['object']['current_period_end']
            end_date = datetime.fromtimestamp(end_date_timestamp).date()
            user_subscription.end_date = end_date

            # Fetch the premium plan from your database
            premium_plan = SubscriptionPlan.objects.get(name='WordUpp Premium')
            
            # Update the user's plan
            user_subscription.plan = premium_plan
            user_subscription.save()

            print("User Subscription updated successfully!")

        except UserSubscription.DoesNotExist:
            print("User Subscription not found.")

    elif event['type'] == 'customer.subscription.created':
        stripe_subscription_id = event['data']['object']['id']
        stripe_customer_id = event['data']['object']['customer']

        try:
            # Find the user by the saved Stripe customer ID
            user_subscription = UserSubscription.objects.get(stripe_customer_id=stripe_customer_id)
            user = user_subscription.user

            # Fetch the premium plan from your database
            premium_plan = SubscriptionPlan.objects.get(name='WordUpp Premium')

            # Update the UserSubscription
            user_subscription.stripe_subscription_id = stripe_subscription_id
            user_subscription.plan = premium_plan  # Set the plan here
            user_subscription.save()

            print("New subscription created successfully!")
        except UserSubscription.DoesNotExist:
            print("User Subscription not found.")

    elif event['type'] == 'customer.subscription.deleted':
        stripe_subscription_id = event['data']['object']['id']
        try:
            user_subscription = UserSubscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            user_subscription.delete()  # or mark as inactive based on your needs
        except UserSubscription.DoesNotExist:
            print(f"User Subscription with stripe_customer_id {stripe_customer_id} not found.")

    # Log the processed event
    MyStripeEventModel.objects.create(
        stripe_event_id=stripe_event_id,
        type=event['type']
    )

    return HttpResponse(status=200)

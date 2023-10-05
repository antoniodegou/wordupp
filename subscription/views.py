from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.contrib import messages
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
import stripe
from .models import UserSubscription, SubscriptionPlan, MyStripeEventModel
from datetime import datetime
import logging

# Initialize your logger
logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY


 

 
@login_required
def subscribe_premium(request):
    """
    Handles the process of subscribing the user to a premium plan.
    1. Creates a Stripe customer.
    2. Associates the Stripe customer ID with the user.
    3. Initiates a Stripe Checkout Session for the subscription.
    """


    if settings.DEBUG:
        base_url = 'http://localhost:8000'
    else:
        base_url = 'https://wordupp-c-cabc02e1ce9a.herokuapp.com'

    success_url = f'{base_url}/dashboard/?subscription=success'
    cancel_url = f'{base_url}/dashboard/?subscription=cancel'
    print(f"User authenticated after Stripe: {request.user.is_authenticated}")
    wordupp_premium_plan = SubscriptionPlan.objects.get(name='WordUpp Premium')
   
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
        print("AAABBCC: ", stripe_customer.id ) 
        if not created:
            user_subscription.stripe_customer_id = stripe_customer.id
            user_subscription.is_active = True
            user_subscription.plan = wordupp_premium_plan
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
                success_url=success_url,
                cancel_url=cancel_url,
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
    """
    Cancels the user's current subscription.
    1. Deletes the Stripe subscription.
    2. Updates the user's subscription record in the database.
    """
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
    """
    Opens Stripe's customer portal for the user to manage their subscription.
    """
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
        error_message = f'Oh, sugar! Something went wrong: {str(e)}'
        messages.error(request, error_message)
        logger.error(error_message)
        return redirect('dashboard')
    



@transaction.atomic  # Makes sure all DB operations are atomic
@csrf_exempt
def stripe_webhook(request):
    """
    Handles various Stripe webhook events.
    1. Subscription updates.
    2. Subscription creation.
    3. Subscription deletion.
    4. Checkout session completion.
    Logs the processed events to avoid duplicate handling.
    """
    print("Webhook received")
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
        print(f"Event ID: {event['id']}")  # New log
        print(f"Event Type: {event['type']}")  # New log
        #print(f"Event Data: {event['data']}")  # New log
    except ValueError as e:
        print(f"ValueError: {e}")  # New log
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        print(f"SignatureVerificationError: {e}")  # New log
        return HttpResponse(status=400)

    # Check if this event was already processed
    stripe_event_id = event['id']
    if MyStripeEventModel.objects.filter(stripe_event_id=stripe_event_id).exists():
        return HttpResponse(status=200)  # Already processed this event

 
    # Handle the event
    if event['type'] == 'customer.subscription.updated':
        print("Handling customer.subscription.updated")  # New log
        stripe_subscription_id = event['data']['object']['id']
        subscription_status = event['data']['object']['status']
        print(subscription_status)
        previous_attributes = event['data'].get('previous_attributes', {})
        print("HELOW updated: ", stripe_subscription_id)
        
        try:
            user_subscription = UserSubscription.objects.get(stripe_subscription_id=stripe_subscription_id)

            # Check if the subscription was previously canceled
            if previous_attributes.get('canceled_at'):
                free_plan = SubscriptionPlan.objects.get(name='WordUpp Free')
                user_subscription.plan = free_plan
                user_subscription.is_active = False
            elif event['data']['object'].get('cancel_at_period_end'):
                user_subscription.is_active = False
            else:
                premium_plan = SubscriptionPlan.objects.get(name='WordUpp Premium')
                user_subscription.plan = premium_plan
                user_subscription.is_active = True

            # Update the end date
            end_date_timestamp = event['data']['object']['current_period_end']
            end_date = datetime.fromtimestamp(end_date_timestamp).date()
            user_subscription.end_date = end_date

            user_subscription.save()
            print("User Subscription updated successfully!")

        except UserSubscription.DoesNotExist:
            print("User Subscription not found.")

 

    elif event['type'] == 'customer.subscription.created':
        print("Handling customer.subscription.created")  # New log
        stripe_subscription_id = event['data']['object']['id']
        stripe_customer_id = event['data']['object']['customer']
        print("HELOW created: ", stripe_subscription_id)
        try:
            # Find the user by the saved Stripe customer ID
            user_subscription = UserSubscription.objects.get(stripe_customer_id=stripe_customer_id)
   

            # Fetch the premium plan from your database
            premium_plan = SubscriptionPlan.objects.get(name='WordUpp Premium')
            # Log the user in
  
            # Update the UserSubscription
            user_subscription.stripe_subscription_id = stripe_subscription_id
            user_subscription.plan = premium_plan  # Set the plan here
            user_subscription.save()

            print("New subscription created successfully!")
        except UserSubscription.DoesNotExist:
            print("User Subscription not found.")

    elif event['type'] == 'customer.subscription.deleted':
        print("Handling customer.subscription.deleted")  # New log
        print("Subscription deleted event triggered!")
        stripe_subscription_id = event['data']['object']['id']
        print("HELOW deleted: ", stripe_subscription_id)
        try:
            user_subscription = UserSubscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            
            # Fetch the free plan from your database
            free_plan = SubscriptionPlan.objects.get(name='WordUpp Free')
            
            # Update the UserSubscription
            user_subscription.plan = free_plan
            user_subscription.stripe_subscription_id = None  # You can set this to None since the subscription is deleted
            user_subscription.is_active = False  # Set to inactive
            user_subscription.save()


            print("Subscription canceled and reverted to free plan.")
            
        except UserSubscription.DoesNotExist:
            print(f"User Subscription with stripe_subscription_id {stripe_subscription_id} not found.")


    elif event['type'] == 'checkout.session.completed':
        print("Handling checkout.session.completed")  # New log
        stripe_customer_id = event['data']['object']['customer']
        print("HELOW completed: ", stripe_subscription_id)
        try:
            user_subscription = UserSubscription.objects.get(stripe_customer_id=stripe_customer_id)
            
            # Update the user's subscription status here
            user_subscription.is_active = True  # or whatever you need to update
            user_subscription.save()

            print("User subscription updated successfully!")
        except UserSubscription.DoesNotExist:
            print("User Subscription not found.")

    # Log the processed event
    MyStripeEventModel.objects.create(
        stripe_event_id=stripe_event_id,
        type=event['type']
    )
    print(f"Logged event with ID: {stripe_event_id}")  # New log
    return HttpResponse(status=200)

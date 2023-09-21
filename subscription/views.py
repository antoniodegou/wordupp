from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import SubscriptionPlan, UserSubscription
from datetime import datetime, timedelta
import stripe
from django.conf import settings
from django.contrib import messages  # Don't forget to add this at the top

stripe.api_key = settings.STRIPE_SECRET_KEY

print("Stripe API Key:", stripe.api_key)
from django.urls import reverse

 

 


@login_required
def subscribe_free(request):
    try:
        # Create Stripe customer if not already created
        stripe_customer_id = None
        try:
            stripe_customer_id = request.user.subscription.stripe_customer_id
        except UserSubscription.DoesNotExist:
            pass
        print("Stripe Customer ID:", stripe_customer_id)  # Debugging line
        print("Stripe API Key:", stripe.api_key)  # Debugging line

        if not stripe_customer_id:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=request.user.username,
            )

            print("Stripe Customer:", customer)  # Debugging line
            stripe_customer_id = customer['id']
        print("All Subscription Plans:", list(SubscriptionPlan.objects.values('id', 'price')))  # Debugging line

        # Fetch the free plan price (assuming it's £0.00)
        free_plan = SubscriptionPlan.objects.get(price=0.00)

        # Create or update UserSubscription
        user_sub, created = UserSubscription.objects.update_or_create(
            user=request.user,
            defaults={
                'plan': free_plan,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=30)).date(),
                'stripe_customer_id': stripe_customer_id
            }
        )
        messages.success(request, 'Successfully subscribed to the free plan!')
        

        # Create a Stripe Checkout Session for free subscription
        session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1NmG4RCOAyay7VTLqfqUxOud',  # Replace with the Stripe Price ID for free plan
                'quantity': 1,
            }],
            mode='subscription',  # Change this line
            success_url=request.build_absolute_uri(reverse('dashboard')) + '?success=true',
            cancel_url=request.build_absolute_uri(reverse('dashboard')) + '?cancelled=true',
        )
        messages.success(request, 'Successfully subscribed to the free plan!')

        # Redirect to Stripe Checkout
        return redirect(session.url)

    except SubscriptionPlan.DoesNotExist:
        messages.error(request, 'The free plan does not exist.')
    except stripe.error.StripeError as e:
        messages.error(request, 'An error occurred while processing your subscription.')
    
    return redirect('dashboard')



@login_required
def subscribe_premium(request):
    try:
        # Create Stripe customer if not already created
        if not request.user.subscription.stripe_customer_id:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=request.user.username,
            )
            stripe_customer_id = customer['id']
        else:
            stripe_customer_id = request.user.subscription.stripe_customer_id

        # Fetch the Stripe customer
        stripe_customer = stripe.Customer.retrieve(stripe_customer_id)

        # Check if the customer has a default payment method
        if not stripe_customer.default_source:
            print("No default payment method. Redirecting to payment setup...")  # Debugging line
            return redirect('enter_payment_details')

        # ... (rest of your existing code)

    except SubscriptionPlan.DoesNotExist:
        # Handle case when the premium plan is not found
        pass
    except stripe.error.StripeError:
        # Handle Stripe errors
        pass

    return redirect('dashboard')  # Redirect to dashboard or an error page



@login_required
def upgrade_subscription(request):
    try:
        # Fetch the premium plan price (assuming it's £0.99)
        premium_plan = SubscriptionPlan.objects.get(price=0.99)
        stripe_price_id = premium_plan.stripe_plan_id  # Make sure this matches your model
        stripe_customer = stripe.Customer.retrieve(request.user.subscription.stripe_customer_id)

        if not stripe_customer.default_source:
            print("No default payment method. Redirecting to payment setup...")  # Debugging line

            # Create a Stripe Billing Portal session
            session = stripe.billing_portal.Session.create(
                customer=stripe_customer.id,
                return_url=request.build_absolute_uri(reverse('dashboard'))
            )

            # Redirect to the Stripe Billing Portal
            return redirect(session.url)


        # Create Stripe Subscription
        subscription = stripe.Subscription.create(
            customer=request.user.subscription.stripe_customer_id,
            items=[
                {
                    'price': stripe_price_id,
                },
            ],
        )
        print(f"Stripe Subscription: {subscription}")  # Debugging line

        if subscription['status'] == 'active':
            print("Subscription is active. Updating database...")  # Debugging line
            # Create or update UserSubscription
            user_sub, created = UserSubscription.objects.update_or_create(
                user=request.user,
                defaults={
                    'plan': premium_plan,
                    'stripe_subscription_id': subscription['id'],  # Store the Stripe Subscription ID
                    'start_date': datetime.fromtimestamp(subscription['current_period_start']),
                    'end_date': datetime.fromtimestamp(subscription['current_period_end']),
                    'stripe_customer_id': request.user.subscription.stripe_customer_id
                }
            )
            messages.success(request, 'Successfully upgraded your subscription!')
        else:
            print(f"Subscription is not active. Status: {subscription['status']}")
            messages.warning(request, 'Could not upgrade your subscription. Please try again.')

        return redirect('dashboard')

    except SubscriptionPlan.DoesNotExist:
        print("SubscriptionPlan does not exist")  # Debugging line
        messages.error(request, 'The subscription plan you selected does not exist.')
        return redirect('dashboard')
    except stripe.error.StripeError as e:
        print(f"Stripe error occurred: {str(e)}")  # Debugging line
        messages.error(request, 'An error occurred while processing your payment.')
        return redirect('dashboard')
    except Exception as e:
        print(f"An unknown error occurred: {str(e)}")  # Debugging line
        messages.error(request, 'An unknown error occurred.')
        return redirect('dashboard')



@login_required
def downgrade_subscription(request):
    try:
        # Fetch the free plan (assuming it's £0.00)
        free_plan = SubscriptionPlan.objects.get(price=0.00)

        # Fetch the user's current subscription
        user_sub = UserSubscription.objects.get(user=request.user)

        # Check if the user is already on a free plan
        if user_sub.plan == free_plan:
            messages.info(request, 'You are already on the free plan.')
            return redirect('dashboard')

        # Check if the premium cycle is over
        if user_sub.end_date <= datetime.now().date():
            user_sub.plan = free_plan
            user_sub.start_date = datetime.now().date()
            user_sub.end_date = (datetime.now() + timedelta(days=30)).date()  # Assuming free plans also have a 30-day cycle
            user_sub.save()
            messages.success(request, 'Successfully downgraded your subscription!')
        else:
            messages.warning(request, 'Your premium cycle is not over yet. You will be downgraded once it ends.')
            # You can handle this in various ways, maybe add a 'pending_downgrade' field to your UserSubscription model

        return redirect('dashboard')

    except SubscriptionPlan.DoesNotExist:
        messages.error(request, 'The free plan does not exist.')
    except UserSubscription.DoesNotExist:
        messages.error(request, 'Your subscription was not found.')
    
    return redirect('dashboard')



import stripe
from django.shortcuts import redirect

def customer_portal(request):
    # Fetch the logged-in user's Stripe customer ID
    stripe_customer_id = request.user.subscription.stripe_customer_id

    # Create a portal session
    session = stripe.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url="your_return_url_here",  # Where to redirect users after they're done in the portal
    )

    # Redirect to the portal
    return redirect(session.url)
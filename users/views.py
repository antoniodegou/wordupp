from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, authenticate
from users.forms import UserRegisterForm
from django.contrib.auth.forms import AuthenticationForm

from django.contrib.auth import logout
from .forms import UserUpdateForm
from django.http import JsonResponse
from datetime import datetime 
from subscription.models import UserSubscription  # Adjust the import based on your project structure
from subscription.models import SubscriptionPlan, UserSubscription 
# Registration View
def register(request):
    if request.user.is_authenticated:
        return redirect('dashboard')  # If already logged go here
    
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # Log in the user after successful registration

            # Automatically assign them to the free plan
            free_plan = SubscriptionPlan.objects.get(name='WordUpp Free')
            UserSubscription.objects.create(
                user=user, 
                plan=free_plan, 
                start_date=datetime.now()  # Set the start_date to now
            )

            messages.success(request, f'Your account has been created! You are now logged in.')
            return redirect('dashboard')  # Redirect to dashboard or desired page
    else:
        form = UserRegisterForm()
    return render(request, 'register.html', {'form': form})  # Adjust template name if needed

# Login View
def user_login(request):
    if request.user.is_authenticated:
        return redirect('dashboard') # If already logged go here
    
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard')  # Redirect to dashboard or desired page
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})  # Adjust template name if needed


 

def user_logout(request):
    logout(request)
    # After logging out, redirect the user to the homepage or login page.
    return redirect('login')  # adjust as needed



@login_required
def delete_account(request):
    user = request.user
    logout(request)
    user.delete()
    messages.success(request, 'Account deleted successfully')
    return redirect('register')




"""
    YA
 """


@login_required
def dashboard(request):
    """
    Render the dashboard page.
    """
    print(f"User authenticated after Stripe: {request.user.is_authenticated}")
    downloads_left = 0  # Default value
    session_id = request.GET.get('session_id')
    subscription_status = request.GET.get('subscription')

    if session_id:
        try:
            user_subscription = UserSubscription.objects.get(stripe_customer_id=session_id)
            login(request, user_subscription.user)
        except UserSubscription.DoesNotExist:
            messages.warning(request, "Couldn't find a subscription with that session ID, sugar.")


    if subscription_status == 'success':
        # You already have the user info because they're logged in
        login(request, request.user)
        messages.success(request, 'Yeehaw! Your subscription was successful, darlin\'!')
        
    context = {}
    user_subscription = None

    try:
        user_subscription = UserSubscription.objects.get(user=request.user)
    except UserSubscription.DoesNotExist:
        pass  # User has no subscription        


    if request.method == 'POST':
        action = request.POST.get('action')

        # If the action is to update user details
        if action == 'update_details':
            update_response = handle_user_details_update(request)
            context.update(update_response)
            
            if "success" in update_response:
                return JsonResponse(update_response)
        
        elif action == 'change_password':
            password_change_response = handle_password_change(request)
            context.update(password_change_response)
            
            if "success" in password_change_response:
                return JsonResponse(password_change_response)
        
        
        # Handle other actions like upgrade_subscription here if needed

    else:
        # Only initialize these on a non-POST request
        u_form = UserUpdateForm(instance=request.user)
        p_form = PasswordChangeForm(request.user)
        context['u_form'] = u_form
        context['p_form'] = p_form

    try:
        downloads_left = max(0, 10 - user_subscription.downloads_this_month)  # Replace 10 with your actual limit
        is_limit_reached = downloads_left == 0
    except UserSubscription.DoesNotExist:
        pass  # User has no subscription
    context['downloads_left'] = downloads_left  # Add to context
    
    context['user_subscription'] = user_subscription
    context['is_limit_reached'] = is_limit_reached  # Add to context
    context['downloads_this_month'] = user_subscription.downloads_this_month  # Add to context
 


    return render(request, 'dashboard.html', context)


def handle_user_details_update(request):
    """
    Process the user's details update and return the context.
    """
    u_form = UserUpdateForm(request.POST, instance=request.user)
    
    if u_form.is_valid():
        u_form.save()
        messages.success(request, f'Your account has been updated!')
        return {'success': True}
    else:
        errors = {field: error_list[0] for field, error_list in u_form.errors.items()}
        return {'success': False, 'errors': errors}  # We only return success status and errors



def handle_password_change(request):
    """
    Handle the password change functionality.
    """
    context = {}
    p_form = PasswordChangeForm(request.user, request.POST)
    
    if p_form.is_valid():
        p_form.save()
        
        # Re-authenticate and login the user after changing password
        user = authenticate(username=request.user.username, password=request.POST['new_password1'])
        if user is not None:
            login(request, user)

        messages.success(request, f'Your password has been updated!')
        return {'success': True}
    else:
        errors = {field: error_list[0] for field, error_list in p_form.errors.items()}
        return {'success': False, 'errors': errors}


@login_required
def delete_account(request):
    if request.method == "POST":
        user = request.user
        user.delete()  # This deletes the user and associated data.
        messages.success(request, "Your account has been deleted successfully.")
        return redirect('login')  # Redirect to a safe page after deletion.
    return redirect('dashboard')  # In case of any other request type, redirect back to the dashboard.
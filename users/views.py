from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.contrib.auth.forms import PasswordChangeForm, AuthenticationForm
from django.http import JsonResponse
from datetime import datetime
from users.forms import UserRegisterForm, UserUpdateForm
from subscription.models import SubscriptionPlan, UserSubscription  # Adjust the import based on your project structure




def register(request):
    """
    This view handles the user registration process.

    Parameters:
    - request: The HTTP request object. This is used to capture the form data and any other request-related information.

    Steps:
    1. If the user is already authenticated, redirect them to the dashboard.
    2. If the request method is POST, validate the form data and create a new user.
    3. Log the user in automatically after successful registration.
    4. Assign them to a free subscription plan.
    5. Redirect them to the dashboard.

    Note: 
    - The UserRegisterForm is a custom Django form for user registration.
    - The SubscriptionPlan and UserSubscription models are used for managing user subscriptions.
    """
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



def user_login(request):
    """
    This view handles the user login process.

    Parameters:
    - request: The HTTP request object. This is used to capture the form data and any other request-related information.

    Steps:
    1. If the user is already authenticated, redirect them to the dashboard.
    2. If the request method is POST, validate the form data and authenticate the user.
    3. Log the user in and redirect them to the dashboard.

    Note:
    - The AuthenticationForm is a built-in Django form for user authentication.

    """
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
    """
    This view handles user logout.

    Parameters:
    - request: The HTTP request object. It is used to capture any request-related information, though in this case, it's not needed for much.

    Steps:
    1. Log the user out using Django's built-in logout function.
    2. Redirect the user to the login page or any other page you wish.

    Note:
    - The logout function takes care of invalidating the user's session, so you don't have to worry about it.

    """
    logout(request)
    return redirect('login')  # adjust as needed



@login_required
def delete_account(request):
    """
    This view handles account deletion for authenticated users.

    Parameters:
    - request: The HTTP request object. It captures any request-related information.

    Steps:
    1. Check if the user is authenticated via the @login_required decorator.
    2. Get the current logged-in user.
    3. Log the user out to invalidate their session.
    4. Delete the user from the database.
    5. Display a success message.
    6. Redirect the user to the registration page.

    Note:
    - The @login_required decorator ensures that only logged-in users can access this view.
    - Deleting the user will remove all associated data from the database. Make sure this is what you want.

    """
    user = request.user
    logout(request)
    user.delete()
    messages.success(request, 'Account deleted successfully')
    return redirect('register')




@login_required
def dashboard(request):
    """
    This view handles rendering and functionality for the dashboard page.

    Parameters:
    - request: The HTTP request object.

    Steps:
    1. Print user authentication status (for debugging).
    2. Initialize some variables, including the Stripe session ID and subscription status.
    3. If the session ID exists, attempt to log the user in based on their subscription.
    4. If the subscription status is 'success', display a success message.
    5. Initialize the context dictionary for the template.
    6. Check if the user is already subscribed.
    7. If the request is a POST request, handle actions like updating user details or changing the password.
    8. Otherwise, initialize the UserUpdateForm and PasswordChangeForm.
    9. Calculate the remaining downloads based on the subscription and add this to the context.
    10. Finally, render the dashboard template with the context.

    Note:
    - The @login_required decorator ensures that only logged-in users can access this view.
    """
    print(request.user.is_authenticated)

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
    This function handles the update of user details when called from the dashboard view.

    Parameters:
    - request: The HTTP request object.

    Returns:
    A dictionary containing:
    - 'success': A boolean indicating if the update was successful.
    - 'errors': A dictionary of field errors if the update failed.

    Steps:
    1. Initialize the UserUpdateForm with POST data and the current user instance.
    2. Validate the form.
    3. If the form is valid, save the changes and return a success status.
    4. If the form is invalid, collect the errors and return them along with a failure status.

    Note:
    - This function is intended to be called within an AJAX request from the dashboard view.
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
    This function handles the password change action when called from the dashboard view.

    Parameters:
    - request: The HTTP request object.

    Returns:
    A dictionary containing:
    - 'success': A boolean indicating if the password change was successful.
    - 'errors': A dictionary of field errors if the password change failed.

    Steps:
    1. Initialize the PasswordChangeForm with POST data and the current user instance.
    2. Validate the form.
    3. If the form is valid, save the new password and re-authenticate the user.
    4. If the form is invalid, collect the errors and return them along with a failure status.

    Note:
    - This function is intended to be called within an AJAX request from the dashboard view.
    - The user is re-authenticated and logged in after the password change to update the session.
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
    """
    This function allows logged-in users to permanently delete their account.

    Parameters:
    - request: The HTTP request object.

    Returns:
    An HTTP redirect response.

    Steps:
    1. Check if the request method is POST.
    2. If it is POST, delete the user and associated data.
    3. Display a success message and redirect to the login page.
    4. If the request is not a POST request, redirect back to the dashboard.

    Note:
    - This function should be called when a user confirms they want to delete their account.
    - The user must be logged in to access this function (@login_required).
    """
    if request.method == "POST":
        user = request.user
        user.delete()  # This deletes the user and associated data.
        messages.success(request, "Your account has been deleted successfully.")
        return redirect('login')  # Redirect to a safe page after deletion.
    return redirect('dashboard')  # In case of any other request type, redirect back to the dashboard.
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash

# Create your views here.
# def login(request):
#     return render(request, 'login.html')


# def register(request):
#     return render(request, 'register.html')


from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, authenticate
from users.forms import UserRegisterForm
from django.contrib.auth.forms import AuthenticationForm
# Registration View
def register(request):
    if request.user.is_authenticated:
        return redirect('dashboard')  # If already logged go here
    
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # Log in the user after successful registration
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


# @login_required
# def dashboard(request):
#     return render(request, 'dashboard.html')



def user_logout(request):
    logout(request)
    # After logging out, redirect the user to the homepage or login page.
    return redirect('login')  # adjust as needed


from django.contrib.auth import logout

@login_required
def delete_account(request):
    user = request.user
    logout(request)
    user.delete()
    messages.success(request, 'Account deleted successfully')
    return redirect('register')


from .forms import UserUpdateForm

# @login_required
# def dashboard(request):
#     if request.method == 'POST':
#         u_form = UserUpdateForm(request.POST, instance=request.user)
        
#         if u_form.is_valid():
#             u_form.save()
#             messages.success(request, f'Your account has been updated!')
#             return redirect('dashboard')
#         else:
#             request.user.refresh_from_db()
#     else:
#         u_form = UserUpdateForm(instance=request.user)

#     context = {
#         'u_form': u_form
#     }

#     return render(request, 'dashboard.html', context)


# views.py

# @login_required
# def update_user_details(request):
#     """
#     Handle the user's details update functionality.

#     Args:
#     - request: The HTTP request object.

#     Returns:
#     - An HTTP response rendering the dashboard template.
#     """
#     if request.method == 'POST':
#         u_form = UserUpdateForm(request.POST, instance=request.user)  # Initialize form with POST data
        
#         if u_form.is_valid():
#             u_form.save()
#             messages.success(request, f'Your account has been updated!')
#             return redirect('dashboard')
#         else:
#             messages.error(request, 'There was an error updating your profile.')
#     else:
#         u_form = UserUpdateForm(instance=request.user)
    
#     context = {
#         'u_form': u_form
#     }
    
#     return render(request, 'dashboard.html', context)


# @login_required
# def dashboard(request):
#     """
#     Render the dashboard page.

#     Args:
#     - request: The HTTP request object.

#     Returns:
#     - An HTTP response rendering the dashboard template.
#     """
#     return render(request, 'dashboard.html')


"""
    YA
 """

from django.http import JsonResponse

# @login_required
# def dashboard(request):
#     """
#     Render the dashboard page.
#     """
#     context = {}
    
#     # Initialize forms
#     u_form = UserUpdateForm(instance=request.user)
#     p_form = PasswordChangeForm(request.user)

#     # If it's a POST request, handle form submissions
#     if request.method == 'POST':
#         action = request.POST.get('action')
        
#         # If the action is to update user details
#         if action == 'update_details':
#             u_form = UserUpdateForm(request.POST, instance=request.user)
#             if u_form.is_valid():
#                 u_form.save()
#                 messages.success(request, f'Your account has been updated!')
#                 return JsonResponse({'success': True})
               
      
#             if not u_form.is_valid():
#                 errors = {field: error_list[0] for field, error_list in u_form.errors.items()}
#                 return JsonResponse({'success': False, 'errors': errors})
                
           

#         elif action == 'change_password':
#             p_form = PasswordChangeForm(request.user, request.POST)
#             if p_form.is_valid():
#                 p_form.save()
#                 messages.success(request, f'Your password has been updated!')
#                 return redirect('dashboard')
        
#         # Handle other actions like upgrade_subscription here if needed

#     context['u_form'] = u_form
#     context['p_form'] = p_form

#     return render(request, 'dashboard.html', context)




# def handle_user_details_update(request):
#     """
#     Process the user's details update and return the context.
#     """
#     context = {}
#     u_form = UserUpdateForm(request.POST, instance=request.user)
    
#     if u_form.is_valid():
#         u_form.save()
#         messages.success(request, f'Your account has been updated!')
#         return JsonResponse({'success': True})
#     else:
#         # Refresh the user instance to reflect the state in the database
#         request.user.refresh_from_db()
#         errors = {field: error_list[0] for field, error_list in u_form.errors.items()}
#         return JsonResponse({'success': False, 'errors': errors})
 
    
#     context['u_form'] = u_form
#     return context

# def handle_password_change(request):
#     """
#     Process the user's password change and return the context.
#     """
#     context = {}
#     if request.method == 'POST':
#         p_form = PasswordChangeForm(request.user, request.POST)
#         if p_form.is_valid():
#             user = p_form.save()
#             # Update the session so the user doesn't get logged out
#             update_session_auth_hash(request, user)
#             messages.success(request, 'Your password was successfully updated!')
#         else:
#             messages.error(request, 'Please correct the error below.')
#     else:
#         p_form = PasswordChangeForm(request.user)

#     context['p_form'] = p_form
#     return context




@login_required
def dashboard(request):
    """
    Render the dashboard page.
    """
    context = {}

    if request.method == 'POST':
        action = request.POST.get('action')
        
        # If the action is to update user details
        if action == 'update_details':
            update_response = handle_user_details_update(request)
            context.update(update_response)
            
            if "success" in update_response:
                return JsonResponse(update_response)
        
        elif action == 'change_password':
            context.update(handle_password_change(request))
        
        # Handle other actions like upgrade_subscription here if needed

    else:
        # Only initialize these on a non-POST request
        u_form = UserUpdateForm(instance=request.user)
        p_form = PasswordChangeForm(request.user)
        context['u_form'] = u_form
        context['p_form'] = p_form

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
        messages.success(request, f'Your password has been updated!')
        return {'success': True}
    else:
        return {'success': False, 'p_form': p_form}

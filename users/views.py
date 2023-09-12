from django.shortcuts import render
from django.contrib.auth.decorators import login_required
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
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard')  # Redirect to dashboard or desired page
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})  # Adjust template name if needed


@login_required
def dashboard(request):
    return render(request, 'dashboard.html')

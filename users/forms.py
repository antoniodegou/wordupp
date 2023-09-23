from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import UserChangeForm
from django.core.exceptions import ValidationError

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def clean_email(self):
        print("clean_email is being called!")  # Debugging print statement

        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email already exists")
        return email


class UserUpdateForm(UserChangeForm):
    email = forms.EmailField()
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']


# from django.contrib.auth.models import AbstractUser
# from django.core.exceptions import ValidationError

# class UserUpdateForm(UserChangeForm):
#     email = forms.EmailField()
    
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'first_name', 'last_name']

#     def clean_username(self):
#         username = self.cleaned_data.get('username')
#         # Validate username against regex and uniqueness
#         if not AbstractUser.username_validator.regex.match(username):
#             raise ValidationError(AbstractUser.username_validator.message)

#         # Check for uniqueness
#         if User.objects.exclude(pk=self.instance.pk).filter(username=username).exists():
#             raise ValidationError("A user with that username already exists.")
        
#         return username
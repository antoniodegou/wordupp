from django.shortcuts import render
from django.contrib import messages
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from .models import UserSubscription, DownloadLog
from celery import shared_task



 
def canvas(request):
    """
Displays the canvas page, showing the user's download information based on their subscription level.
The view checks if the user is on a premium plan to calculate the downloads left for the month.
"""
    user = request.user
    user_subscription = UserSubscription.objects.get(user=user)
    is_premium = user_subscription.plan.name == 'WordUpp Premium'  # Replace 'Premium' with your actual premium plan name

    if is_premium:
        downloads_left = 'Unlimited'
        is_limit_reached = False
    else:
        downloads_left = max(0, 10 - user_subscription.downloads_this_month)  # Replace 10 with your actual limit
        is_limit_reached = downloads_left == 0

    context = {
        'downloads_left': downloads_left,
        'is_limit_reached': is_limit_reached,
    }
    return render(request, 'canvas.html', context)


def handle_download(request):
    """
Handles the file download request.
- Increments the user's download count for the month.
- Checks if the user has reached their monthly download limit.
"""
    try:
        user = request.user
        user_subscription = UserSubscription.objects.get(user=user)
        
        print(f"Plan name: {user_subscription.plan.name}")
        print(f"Downloads this month before increment: {user_subscription.downloads_this_month}")

        # Increment the download count and save
        user_subscription.downloads_this_month += 1
        user_subscription.save()

        print(f"Downloads this month after increment: {user_subscription.downloads_this_month}")

        # Check if the user has reached the download limit
        if user_subscription.plan.name == 'WordUpp Free' and user_subscription.downloads_this_month > 10:

            print("oi")
            messages.warning(request, "You've reached your download limit for this month, sugar!")
            return JsonResponse({'status': 'limit_reached', 'message': "You've reached your download limit for this month, sugar!"})
        
        
        # Log the download
        DownloadLog.objects.create(user=user)
        
        return JsonResponse({'status': 'success', 'message': 'Download successful'})
    
    except ObjectDoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Something went wrong, sugar. Please try again.'})



@shared_task
def reset_monthly_download_count():
    """
Celery task to reset the monthly download count for all users to 0.
This should be scheduled to run at the beginning of each month.
"""
    UserSubscription.objects.update(downloads_this_month=0)
    
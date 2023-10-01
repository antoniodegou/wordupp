from django.shortcuts import render
from .models import UserSubscription
from celery import shared_task
from django.contrib import messages
from django.shortcuts import render
from .models import DownloadLog
from subscription.models import UserSubscription
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist


 
def canvas(request):
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
    UserSubscription.objects.update(downloads_this_month=0)
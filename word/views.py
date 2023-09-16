from django.shortcuts import render

# Create your views here.
 
def canvas(request):
    return render(request, 'canvas.html')


from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import CanvasState
import json

@login_required
def save_canvas_state(request):
    if request.method == "POST":
        state = request.POST.get('state')
        title = request.POST.get('title', 'Untitled')
        user = request.user
        CanvasState.objects.update_or_create(
            user=user,
            title=title,
            defaults={'state': state}
        )
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "error"})

@login_required
def load_canvas_state(request, title=None):
    try:
        if title:
            canvas_state = CanvasState.objects.get(user=request.user, title=title)
        else:
            # Handle this case as you wish. Maybe raise an error or grab a default state.
            canvas_state = CanvasState.objects.filter(user=request.user).last()
            if not canvas_state:
                return JsonResponse({'state': None})

        return JsonResponse({'state': canvas_state.state})

    except CanvasState.DoesNotExist:
        return JsonResponse({'state': None})


from .models import CanvasState

@login_required
def canvas_grid(request):
    user = request.user
    canvas_states = CanvasState.objects.filter(user=user)
    return render(request, 'canvas_grid.html', {'canvas_states': canvas_states})

@login_required
def canvas_view(request, title=None):
    canvas_state = None
    if title:
        try:
            canvas_state = CanvasState.objects.get(user=request.user, title=title)
        except CanvasState.DoesNotExist:
            pass
    
    return render(request, 'canvas.html', {'canvas_state_json': json.dumps(canvas_state.state) if canvas_state else None})



from django.http import JsonResponse

# def save_canvas(request):
#     if request.method == "POST":
#         saved_state = request.body.decode('utf-8')
#         # Save this JSON string to your database.
#         # You can use Django models to associate it with a user or a project.

#     return JsonResponse({'status': 'success'})



# def load_canvas(request, canvas_id):  # canvas_id is the identifier for the saved canvas state
#     try:
#         canvas_instance = CanvasState.objects.get(id=canvas_id)
#         saved_state = canvas_instance.saved_state  # Replace 'saved_state' with the actual field name in your model where the JSON is saved
#     except CanvasState.DoesNotExist:
#         return JsonResponse({'status': 'error', 'message': 'Canvas state not found'}, status=404)
    
#     return JsonResponse(saved_state, safe=False)
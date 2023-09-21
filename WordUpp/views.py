from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from .models import Canvas
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse
import json


def create_canvas(request):
    return render(request, 'create_canvas.html')

@login_required
def saved_works(request):
    saved_canvases = Canvas.objects.filter(user=request.user)
    return render(request, 'saved_works.html', {'canvases': saved_canvases})




@login_required
def save_canvas(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        try:
            Canvas.objects.create(
                user=request.user,
                name=data.get('name', 'Untitled'),
                user_text=data.get('user_text'),
                text_color=data.get('text_color'),
                bg_color=data.get('bg_color'),
                word_objects=data.get('wordObjects'),  # Add this line
                horizontal_slider_value=data.get('horizontal_slider_value'),
                vertical_slider_value=data.get('vertical_slider_value')
            )
            return JsonResponse({'status': 'Saved'})
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'status': 'Error'})

@login_required
def load_canvas(request, canvas_id):
    try:
        canvas = Canvas.objects.get(id=canvas_id, user=request.user)
        return JsonResponse({
            'name': canvas.name,
            'user_text': canvas.user_text,
            'text_color': canvas.text_color,
            'bg_color': canvas.bg_color,
            'horizontal_slider_value': canvas.horizontal_slider_value,  # New field
            'vertical_slider_value': canvas.vertical_slider_value,  # New field
            'word_objects': canvas.word_objects
        })
    except Canvas.DoesNotExist:
        return JsonResponse({'status': 'Canvas not found'}, status=404)

from django.http import HttpResponseNotAllowed

@login_required
def update_canvas(request, canvas_id):
    if request.method == 'PUT':
        try:
            # Decode the request body into a Python dictionary
            data = json.loads(request.body.decode('utf-8'))

            # Fetch the canvas by its ID and the user
            canvas = Canvas.objects.get(id=canvas_id, user=request.user)

            # Update fields
            canvas.name = data.get('name', 'Untitled')
            canvas.user_text = data.get('user_text')
            canvas.text_color = data.get('text_color')
            canvas.bg_color = data.get('bg_color')
            canvas.word_objects = data.get('wordObjects')  # Update this line

            # Save the updated canvas
            canvas.save()

            return JsonResponse({'status': 'Updated'})
        except Canvas.DoesNotExist:
            return JsonResponse({'status': 'Canvas not found'}, status=404)
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'status': 'Error'}, status=500)
    else:
        return HttpResponseNotAllowed(['PUT'])

    

@login_required
def edit_canvas(request, canvas_id):
    canvas = Canvas.objects.get(id=canvas_id)
    if request.user != canvas.user:
        return JsonResponse({'status': 'Unauthorized'}, status=401)
    
    return render(request, 'create_canvas.html', {'canvas': canvas, 'is_editing': True})
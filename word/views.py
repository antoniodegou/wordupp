from django.shortcuts import render

# Create your views here.
 
def canvas_view(request):
    return render(request, 'canvas.html')

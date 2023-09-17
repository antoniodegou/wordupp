from django.urls import path
from . import views



urlpatterns = [
    path('create/', views.create_canvas, name='create_canvas'),
    path('saved/', views.saved_works, name='saved_works'),
    path('api/save/', views.save_canvas, name='save_canvas'),
    path('api/load/<int:canvas_id>/', views.load_canvas, name='load_canvas'),
    path('api/update/<int:canvas_id>/', views.update_canvas, name='update_canvas'),
    path('edit/<int:canvas_id>/', views.edit_canvas, name='edit_canvas'),

]
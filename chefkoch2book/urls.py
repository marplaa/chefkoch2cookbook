'''
Created on 23.05.2018

@author: martin
'''
from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_collage/<path:url>/', views.get_collage, name='collage'),
    path('get_recipe/', views.get_recipe, name='recipe'),
    path('get_recipe_data_json/', views.get_recipe_data_json, name='recipe_data_json'),
    path('normal_template/', views.get_normal_template, name='get_normal_template'),
    path('render_recipe/<template>/', views.render_recipe, name='render_recipe'),
]
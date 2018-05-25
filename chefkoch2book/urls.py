'''
Created on 23.05.2018

@author: martin
'''
from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_collage/<url>/', views.get_collage, name='collage'),
]
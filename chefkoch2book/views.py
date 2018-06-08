from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
import re

from bs4 import BeautifulSoup
import urllib3
import chefkoch2book.picture_grid
from PIL import Image
from chefkoch2book import picture_grid
from symbol import except_clause
import json
#from chefkoch2book import collage_maker


def makelist(table):
    result = []
    allrows = table.findAll('tr')
    for row in allrows:
        result.append([])
        allcols = row.findAll('td')
        for col in allcols:
            thestrings=[]
            thestring =""
            for thestring in col.stripped_strings:
                thestring = re.sub(r'\s+',' ',thestring)
                #thestring = thestring.replace('\n', '')
                thestrings.append(thestring)
            thetext = ''.join(thestrings)
            result[-1].append(thetext)
    return result

@ensure_csrf_cookie
def index(request):
    return render(request, 'chefkoch2book/index.html', {'text' : 'hallo'})


def get_recipe_data(url):
    
    recipe = {"url": url}
    
    soup = soupify(url)
    content = soup.find("div", {"class": "content-left"})
    
    recipe['title'] = soup.find("div", {"id": "content"}).find("h1").getText()
    try:
        recipe['subtitle'] = soup.find("div", {"id": "content"}).find("strong").getText()
    except Exception:
        pass
    
    recipe['ingredients'] = makelist(soup.find("table", {"class": "incredients"}))
    imagesdivs = soup.find_all('div', {"class": "gallery-imagewrapper"})
    recipe['recipe_info'] = makelist(content.find("table", {'id':'recipe-info'}).extract())
    recipe['content'] = re.sub(r'\s+',' ',content.get_text('</br>', strip=True)).replace('\n', '')
    
    images = []
    for imagediv in imagesdivs:
        images.append(imagediv.find('img').get('data-bigimage'))
    recipe['images'] = images
    
    return recipe
    
    #ingredientsString = ""
    #for item in ingredients:
    #   ingredientsString += str(item)


def get_recipe_data_json(request):
    url = request.POST['url'];
    recipe_data = get_recipe_data(url)
    return JsonResponse(recipe_data)

# Create your views here.
def get_recipe(request):
    
    #url = request.POST['url']
    
    output = get_recipe_data('https://www.chefkoch.de/rezepte/drucken/1108101216891426/2309481a/1/Apfelkuchen-mit-Streuseln-vom-Blech.html')
        
    #output = "<div>"+ingredientsString+"</div>" + "<div>"+content_pretty+"<h2>INFO</h2> " + recipe_info.prettify() + "</div>" + '<img src="http://localhost:8000/create/get_collage/j">' #+ "<div>"+ingredients+"</div>"
    
    return render(request, 'chefkoch2book/recipes/normal-preview.html', output)

def soupify(url):
    
    if "/drucken/" not in url:
        url = url.replace("/rezepte/", "/rezepte/drucken/")
    http = urllib3.PoolManager()
    response = http.request('GET', url)

    return BeautifulSoup(response.data, 'html.parser')



def get_image_grid(request):
    
    images = request.GET['urls'];
    
    collage_image = picture_grid.create_grid(images, 4, 4, 2100, 2970, 10, 0)
    response = HttpResponse(content_type="image/png")
    collage_image.save(response, "png", dpi=(72,72))
    return response
    
    
    #soup = soupify('https://www.chefkoch.de/rezepte/drucken/1108101216891426/2309481a/1/Apfelkuchen-mit-Streuseln-vom-Blech.html')
    #imagesdivs = soup.find_all('div', {"class": "gallery-imagewrapper"})
    #images = []
    #for imagediv in imagesdivs:
    #    images.append(imagediv.find('img').get('data-bigimage'))
    


def get_collage(request, url):
    soup = soupify(url)
    imagesdivs = soup.find_all('div', {"class": "gallery-imagewrapper"})
    images = []
    for imagediv in imagesdivs:
        images.append(imagediv.find('img').get('data-bigimage'))
        
    collage_image = picture_grid.create_grid(images, 5, 10, int(2100/2), int(2970/2), 10, 0)
    
    response = HttpResponse(content_type="image/png")
    collage_image.save(response, "png", dpi=(72,72))
    return response

def get_normal_template(request):
    if request.POST['template'] is not None:
        template = request.POST['template']
    
    return render(request, 'chefkoch2book/recipes/normal.html')

def render_recipe(request):
    if request.POST['template'] is not None:
        template = request.POST['template']
    else:
        template = "normal"
    url = request.POST['url']
    if request.POST['background'] is not None:
        background = request.POST['background']
    else:
        background = ""
    if request.POST['chapter'] is not None:
        chapter = request.POST['chapter']
    else:
        chapter = ""
    

    
    data = get_recipe_data(url)
    return render(request, 'chefkoch2book/recipes/'+ template +'.html', data)

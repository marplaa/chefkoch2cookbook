from django.shortcuts import render
from django.http import HttpResponse

from bs4 import BeautifulSoup
import urllib3
import chefkoch2book.picture_grid
from PIL import Image
from chefkoch2book import picture_grid
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
            for thestring in col.findAll(text=True):
                thestring = thestring.replace('\n', '')
                thestrings.append(thestring)
            thetext = ''.join(thestrings)
            result[-1].append(thetext)
    return result




# Create your views here.
def index(request):
    
    soup = soupify('https://www.chefkoch.de/rezepte/drucken/1108101216891426/2309481a/1/Apfelkuchen-mit-Streuseln-vom-Blech.html')
    content = soup.find("div", {"class": "content-left"})
    
    ingredients = makelist(soup.find("table", {"class": "incredients"}))
    imagesdivs = soup.find_all('div', {"class": "gallery-imagewrapper"})
    recipe_info = content.find("table", {'id':'recipe-info'}).extract()
    content_pretty = content.prettify()
    
    images = []
    for imagediv in imagesdivs:
        images.append(imagediv.find('img').get('data-bigimage'))
    
    ingredientsString = ""
    for item in ingredients:
        ingredientsString += str(item)
        
    output = "<div>"+ingredientsString+"</div>" + "<div>"+content_pretty+"<h2>INFO</h2> " + recipe_info.prettify() + "</div>" + '<img src="' + images[0] + '">'#+ "<div>"+ingredients+"</div>"
    
    return render(request, 'chefkoch2book/index.html', {'text' : output})

def soupify(url):
    http = urllib3.PoolManager()
    response = http.request('GET', url)

    return BeautifulSoup(response.data, 'html.parser')

def get_image_grid(request, url):
    soup = soupify('https://www.chefkoch.de/rezepte/drucken/1108101216891426/2309481a/1/Apfelkuchen-mit-Streuseln-vom-Blech.html')
    imagesdivs = soup.find_all('div', {"class": "gallery-imagewrapper"})
    images = []
    for imagediv in imagesdivs:
        images.append(imagediv.find('img').get('data-bigimage'))
    

def get_collage(request, url):
    soup = soupify('https://www.chefkoch.de/rezepte/drucken/1108101216891426/2309481a/1/Apfelkuchen-mit-Streuseln-vom-Blech.html')
    imagesdivs = soup.find_all('div', {"class": "gallery-imagewrapper"})
    images = []
    for imagediv in imagesdivs:
        images.append(imagediv.find('img').get('data-bigimage'))
        
    collage_image = picture_grid.create_grid(images, 4, 4, 2050, 2700, 10, 0)
    
    response = HttpResponse(content_type="image/png")
    collage_image.save(response, "png", dpi=(72,72))
    return response
    
    

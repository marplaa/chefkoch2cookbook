'''
Created on 25.05.2018

@author: martin
'''

import random
from PIL import Image, ImageOps
import requests
from io import BytesIO
from math import sqrt

def create_grid(images, n, m, width, height, margin, margin_color, shuffle=False):
    
    img_width = (width-(n+1)*margin)/n
    img_height = (height-(m+1)*margin)/m
    
    if (n*m > len(images)):
        duplicates = n*m - len(images)
        for i in range(duplicates):
            images.append(random.choice(images))
        
    
    # calculate the dimensions of the n images
    
    collage_image = Image.new('RGB', (width, height), (35, 35, 35))
    
    x = margin
    y = margin
    
    for i in range(m):
        for j in range(n):
            response = requests.get(images.pop(0))
            img = Image.open(BytesIO(response.content))
            ratio = img.size[0] / img.size[1]
            if ratio < 1: # if x is smaller than y (portrait)
                wpercent = (img_width/float(img.size[0]))
                hsize = int((float(img.size[1])*float(wpercent)))
                img = img.resize((int(img_width),hsize), Image.ANTIALIAS)
            else:
                wpercent = (img_height/float(img.size[1]))
                vsize = int((float(img.size[0])*float(wpercent)))
                img = img.resize((vsize, int(img_height)), Image.ANTIALIAS)
                
            img = ImageOps.fit(img, (int(img_width), int(img_height)), Image.ANTIALIAS, 0, (0.5, 0.5))
            if collage_image:
                collage_image.paste(img, (int(x), int(y)))
                x += img_width + margin
        y += img_height + margin
        x = margin
    
    #print("x=" + x + " y=" + y)

    return collage_image
/**
 * 
 */

var chapters = [];
var pages = [];

//var recipes = [];

var dom = null;

$(document).ready(document_ready);	

function document_ready() {
	dom = $('body');
	createBook();
}


function createBook() {
	pages.push({elem: "", chapter: null, side: 'l', num: 1, leftCol: "", rightCol: "", cursor: ['l',0]});
	buildChapter(recipes[0]);
	
// let finished = false;
// while (!finished) {
// next = recipes[0].nodes;
// if (Array.isArray(next)) {
// // iterate items
// for (let i = 0; i<next.length; i++) {
// if ('nodes' in next[i]) {
// // is chapter
// addChapterPage(next[i]);
//					
// } else {
// // is recipe
// addRecipe(next[i]);
// }
// }
// }
// }
}

function buildChapter(chapter) {
	if ('nodes' in chapter) {
		// is indeed chapter
		addChapterPage(chapter);
		if (!('nodes' in chapter.nodes[0])){
			addPage(chapter);
		}
		for (let i = 0; i<chapter.nodes.length; i++){
			
			buildChapter(chapter.nodes[i]);
			
		}
	} else {
		// is recipe
		
		addRecipe(chapter);
	}
}

function getPageTemplate(id, side) {
	return '<div id="' + id + '" class="'+ side +'-page page">\
	          <div class="background"></div> \
	          <div class="chapter-container"> \
	            <div class="transbox">\
		           <span></span>\
	            </div>\
              </div>\
              <div class="left-col col"></div>\
              <div class="right-col col"></div>\
          </div>';
}

function getChapterPageTemplate(id, side) {
	return '<div id="' + id + '" class="'+ side +'-page page">\
	          <div class="chapter-page"></div> \
	          <div class="chapter-page-title-container"> \
	            <div class="transbox">\
		           <span></span>\
	            </div>\
              </div>\
          </div>';
}

function addPage(chapter) {
	id = 0;
	let nextnum = pages[pages.length-1].num+1;
	let side = "l";
	if (pages.length%2==0) {
		side = "r";
	}
	let newPage = {elem: "", chapter: chapter, side: side, num: nextnum, leftCol: "", rightCol: "", cursor: ['l',0], bg: ""};
	pages.push(newPage);
	appendPageToDom(newPage);
	return newPage;
}

function addChapterPage(chapter) {
	let nextnum = pages[pages.length-1].num+1;
	let side = "l";
	if (pages.length%2==0) {
		side = "r";
	}
	let newPage = {elem: "", chapter: chapter, side: side, num: nextnum, content: "", bg: ""};
	pages.push(newPage);
	
	let id = "p-" + newPage.num;
	
	let newPageHtml = $(getChapterPageTemplate(id, side));
	dom.append(newPageHtml);
	let element = $('#' + id);
	$(element).find('.chapter-page-title-container span').text(newPage.chapter.title);
	newPage.elem = element;
	if (newPage.bg == "") {
		newPage.bg = chapter.bg;
		$(newPage.elem).find(".chapter-page").css("background-image", 'url("' + chapter.bg + '")');
	}
}

function appendPageToDom(page){
	let id = "p-" + page.num;
	let side = page.side;
	let newPage = $(getPageTemplate(id, side));
	dom.append(newPage);
	let element = $('#' + id);
	$(element).find('.chapter-container span').text(page.chapter.title);
	page.elem = element;
	return element;
}

function buildIngredientsTable(ingredients) {
    var result = "<table>";
    for(var i=0; i<ingredients.length; i++) {
        result += "<tr>";
        result += '<td class="amount">'+ingredients[i][0]+'</td>';
        result += '<td class="ingredient">'+ingredients[i][1]+'</td>';
        result += "</tr>";
    }
    result += "</table>";

    return result;
}

function addRecipe(recipe) {
	let id = recipe.id;
	let page = pages[pages.length -1];
	let col = null;
	if (page.cursor[0] == 'r') {
		col = $(page.elem).find('div.right-col');
	} else {
		col = $(page.elem).find('div.left-col');
	}
	
	let recipeDiv = $('<div id="r-' + id + '"></div>');
	
	let title = $('<div id="t-' + id + '" class="title-container"><span>' + recipe.title + '</span></div>');
	let image = $('<img id="i-' + id + '" class="image" src="' + recipe.img + '">');
	let ingredients = $('<div id="z-' + id + '" class="ingredients-container">' + buildIngredientsTable(recipe.ingredients) + '</div>');
	let content = $('<div id="c-' + id + '" class="content-container"><span>' + recipe.content + '</span></div>');
	
	recipeDiv.append(title,image,ingredients,content);
	
	if (page.bg == "") {
		page.bg = recipe.bg;
		$(page.elem).find(".background").css("background-image", 'url("' + recipe.bg + '")');
	}
	
	col.append(recipeDiv);
	let recipeHeight = $('#r-'+id).outerHeight(true);

	if(page.cursor[1] + recipeHeight > col.height()) {
		// if ingredients list small enough, try to cut content of, else new page
		
		if(page.cursor[1] + $('#t-'+id).outerHeight(true) + $('#z-'+id).outerHeight(true) < col.height()) {
			let i = 0;
			let newContentDiv = $('<div id="cc-' + id + '" class="content-container"><span></span></div>');
			if (page.cursor[0]=="l") {
				//continue on right column
				col = $(page.elem).find('div.right-col');
				page.cursor[0]="r";
				col.append(newContentDiv);
			} else {
				// new page
				addPage(page.chapter);
				var newPage = pages[pages.length -1];
				
				var newCol = $(newPage.elem).find('div.left-col');
				newCol.append(newContentDiv);
			}
			
			let sliceIndex, leftContent, rightContent;
			while(page.cursor[1] + $('#t-'+id).outerHeight(true) + $('#r-'+id).outerHeight(true) > col.height()) {
				sliceIndex = splitContent(recipe.content, i);
				leftContent = recipe.content.slice(0,sliceIndex);
				rightContent = recipe.content.slice(sliceIndex+1);
				$('#c-'+id + ' span').html(leftContent);
				$('#cc-'+id + ' span').html(rightContent);
				
				i++;
			}
			if (newPage) {
				newPage.cursor[1] = $('#cc-'+id).outerHeight(true);
			} else {
				page.cursor[1] = $('#cc-'+id).outerHeight(true);
			}
			
			return;
		}else {
			$('#r-'+id).remove();
			if (page.cursor[0] == 'l') {
				page.cursor[0] = 'r';
				page.cursor[1] = 0;
			} else {
				addPage(page.chapter);
			}
			addRecipe(recipe);
			return;
		}
		
	}
	page.cursor[1] = $('#r-'+id).position()["top"] + recipeHeight;
}

function splitContent(string, pos) {
	let currentPos = string.length-1;
	for (let i = 0; i<pos; i++) {
		while (string[currentPos] != ' ') {
			currentPos--;
		}
		currentPos--;
	}
	return currentPos+1;
}
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
		for (let i = 0; i<chapter.nodes.length; i++){
			buildChapter(chapter.nodes[i]);
		}
	} else {
		// is recipe
		addRecipe(chapter);
	}
}

function getPageTemplate (id, side) {
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
	let newPage = {elem: "", chapter: chapter, side: side, num: nextnum, content: ""};
	pages.push(newPage);
	appendPageToDom(newPage);
	addPage(chapter);
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
	if (page.cursor[0] == "r") {
		col = $(page.elem).find('div.right-col');
	} else {
		col = $(page.elem).find('div.left-col');
	}
	
	let title = $('<div id="t-' + id + '" class="title-container"><span>' + recipe.title + '</span></div>');
	let image = $('<img id="i-' + id + '" class="image" src="' + recipe.img + '">');
	let ingredients = $('<div id="t-' + id + '" class="ingredients-container">' + buildIngredientsTable(recipe.ingredients) + '</div>');
	let content = $('<div id="c-' + id + '" class="content-container"><span>' + recipe.content + '</span></div>');
	
	if (page.bg == "") {
		page.bg = recipe.bg;
		$(page.elem).find(".background").css("background-image", 'url("' + recipe.bg + '")');
	}
	
	col.append(title,image,ingredients,content);
}
var recipes = [{id : "0", title: "Kochbuch", text: 'Kochbuch<a onclick="showChapterModal(\'0\')" href="#" class="recipe-list-button float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i>Kapitel hinzufügen</a>', nodes : []}];

var list_str = ""
	
var bgFolder = '/static/chefkoch2book/backgrounds/chapters/';
	
String.prototype.hashCode = function() {

    var hash = Math.floor(Math.random()*100);
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return String(Math.abs(hash));
}
	
var tree_view_options = 
{
		data: getRecipeTree(), 
		expandIcon:"fas fa-angle-down",
		collapseIcon:"fas fa-angle-up",
		emptyIcon:"far fa-file-alt",
		highlightSelected: false,
}

$(document).ready(document_ready);	

function document_ready() { 
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", {  silent: true });
    //$('#recipes_url_list').bind('drop', handleDrop);
	document.getElementById("recipes_url_list").addEventListener("drop", handleDrop);
    

}


function getRecipeTree() {
	return recipes;
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie("csrftoken");

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});



function getRecipeData(url_str, chapter) {
	
	$.ajax({
		type : "POST",
		url : "/create/get_recipe_data_json/",
		data : {url: url_str},
		success : function (data){newRecipeData(data, chapter);},
	});
    
}

function createRecipeList() {
	$("#recipe-list").empty();
	for (var i=0;i<recipes.length;i++){
	    createList(recipes[i]);
	    $("#recipe-list").append(list_str);
	    list_str = "";
	}
}



/*
 * function createList(item) {
 * 
 * if (item==null) { return; }
 * 
 * if (item.type == "ch") { // unterchapters durchgehen list_str =
 * list_str.concat('<span style="margin: 5px;"><b>" + item.title + "</b></span><ul class="list-group" id="sublist-chapter-" + item.id + "">');
 * 
 * for (var i=0;i<item.content.length;i++){ list_str = list_str.concat('<li class="list-group-item">');
 * createList(item.content[i]); list_str =list_str.concat("</li>") } list_str
 * =list_str.concat("</ul>") } else { list_str =list_str.concat(item.title); } }
 */

function newRecipeData(jsonData, chapterString) {
	saveRecipe(jsonData, chapterString);
}



function getChapterFromString(chapter) {
	
	if (chapter == "0"){
		return recipes[0];
	}
	
	var path = chapter.split("-");
	var currentChapter = recipes[0];
	
	for (var i = 1; i< path.length-1;i++) {
		currentChapter = _.findWhere(currentChapter.nodes, {id : path[i]});
	}
	currentChapter = _.findWhere(currentChapter.nodes, {id : path[i]});
	
	// alert(currentChapter["text"]);
	return currentChapter;
}

function getRecipe(recipeString) {
	var path = recipeString.split("-");
	var chapter = getChapterFromArray(_.first(path,path.length-1));
	
	return _.findWhere(chapter["nodes"], {id : path[path.length-1]});
}

function getChapterFromArray(path) {
	
	if (path == "0"){
		return recipes[0];
	}
	
    var currentChapter = recipes[0];
    
	
	for (var i = 1; i< path.length-1;i++) {
		currentChapter = _.findWhere(currentChapter.nodes, {id : path[i]});
	}
	currentChapter = _.findWhere(currentChapter.nodes, {id : path[i]});
	
	// alert(currentChapter["text"]);
	return currentChapter;
}

function getChapterTitles(chapter) {
	var titles = [];
	if (chapter == "0"){
		return [];
	}
	
	var path = chapter.split("-");
	var currentChapter = recipes[0];
	
	for (var i = 1; i< path.length-1;i++) {
		currentChapter = _.findWhere(currentChapter.nodes, {id : path[i]});
		titles.push(currentChapter.title);
	}

	
	// alert(currentChapter["text"]);
	return titles;
}



function showRecipeModal(chapterString) {
	var chapter = getChapterFromString(chapterString);
	$("#modal-title-chapter").text(chapter.title);
	$("#url-list-chapter").val(chapterString);
	$("#recipes-url-modal").modal("show");
}

function showChapterModal(chapterString) {
	var chapter = getChapterFromString(chapterString);
	$("#chapter-modal-title-chapter").text(chapter.title);
	$("#new-chapter-parent").val(chapterString);
	$("#chapter-modal").modal("show");
}

function addRecipe() {
	var urls = $("#recipes_url_list").val().replace(/\s|\n/g, "").split(";");
	var chapter = $("#url-list-chapter").val();
	for (var i = 0; i< urls.length; i++) {
		getRecipeData(urls[i], chapter);
	}
	// getRecipeData(, $("#url-list-chapter").val());
}

function addChapter() {
	var title = $("#new_chapter_input").val();
	var parentChapter = $("#new-chapter-parent").val();
	
	newChapter(title, parentChapter);

}



function saveRecipe(recipeData, chapterString){
	var chapter = getChapterFromString(chapterString);
	var id = recipeData.title.hashCode();
	
	var deleteButton = '<a onclick="deleteRecipe(\'' + chapterString + '-' + id + '\')" style="margin-left:10px;" href="#" class="float-right"><i class="fas fa-minus-square fa-lg" style="color: gray"></i></a>';
	var previewButton = '';//'<a onclick="showPreview(\'' + chapterString + '-' + id + '\')" style="margin-left:10px;" href="#" class="float-right"><i class="fas fa-eye fa-lg" style="color: gray"></i></a>'
	var optionsButton = '<a onclick="showRecipeOptionsModal(\'' + chapterString + '-' + id + '\');" style="margin-left:10px;" href="#" class="float-right"><i class="fas fa-cog fa-lg" style="color: gray"></i></a>'
	var dataText = recipeData.title + deleteButton + optionsButton + previewButton;
	recipeData["text"] = dataText;
	recipeData["id"] = id;
	recipeData['img'] = recipeData['images'][0];
	recipeData['bg'] = recipeData['images'][1];
	
	chapter["nodes"].push(recipeData);
	chapter["nodes"] = _.sortBy(chapter["nodes"], "title");
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", {  silent: true });
}

function newChapter(title, chapterString){
	var parentChapter = getChapterFromString(chapterString);
	var id = title.hashCode();
	var optionsButton = '<a onclick="showChapterOptionsModal(\'' + chapterString + '-' + id + '\');" style="margin-left:10px;" href="#" class="float-right"><i class="fas fa-cog fa-lg" style="color: gray"></i></a>'
	let deleteButton = '<a onclick="deleteChapter(\'' + chapterString + '-' + id + '\')" href="#" class="recipe-list-button float-right"><i class="fas fa-minus-square fa-lg" style="color: gray"></i></a>';
	var dataText = title + deleteButton  + optionsButton + '<a onclick="showRecipeModal(\'' + chapterString + '-' + id + '\')" href="#" class="recipe-list-button float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i>Rezept</a> <a onclick="showChapterModal(\'' + chapterString + '-' + id + '\')" href="#" class="recipe-list-button float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i>Kapitel</a>';
	var chapter = {};
	chapter["text"] = dataText;
	chapter["title"] = title;
	chapter["id"] = id;
	chapter["nodes"]=[];
	chapter["chapterPath"] = chapterString + "-" + id;
	chapter["bg"] = getChapterBg(chapterString);
	chapter["options"] = {useFirstRecipeBg: true, recipesBg: ""};
	
	parentChapter.nodes.push(chapter);
	
	parentChapter["nodes"] = _.sortBy(parentChapter["nodes"], "title");
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", {  silent: true });
}



function getChapterBg(chapterString) {
	//let titles = getChapterTitles(chapterString);
	if (chapterString == "0"){
		return '/static/chefkoch2book/backgrounds/patterns/kitchen_01.jpg';
	} else {
		let chapters = chapterString.split("-");
		let chapter = getChapterFromArray(_.first(chapters,chapters.length));
		return chapter.bg;
	}
}

function deleteRecipe(recipeString) {
	var path = recipeString.split("-");
	var chapter = getChapterFromArray(_.first(path,path.length-1));
	// var pathid = path[path.length-1];
	var recipe = _.findWhere(chapter["nodes"], {id : path[path.length-1]});
	chapter["nodes"] = _.without(chapter["nodes"], recipe);
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", { silent: true });
}

function deleteChapter(chapterString) {
	var path = chapterString.split("-");
	var parentChapter = getChapterFromArray(_.first(path,path.length-1));
	var pathid = path[path.length-1];
	var chapter = _.findWhere(parentChapter["nodes"], {id : path[path.length-1]});
	parentChapter["nodes"] = _.without(parentChapter["nodes"], chapter);
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", { silent: true });
}
	






function downloadBook() {
var a = document.getElementById("download-book");
var file = new Blob([JSON.stringify(recipes)], {type: 'text/plain'});
a.href = URL.createObjectURL(file);
a.download = "Kochbuch.txt";
a.click();
}

function uploadBook() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
    }

}

function receivedText(e) {
    let lines = e.target.result;
    recipes[0] = JSON.parse(lines)[0]; 
    $("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", { silent: true });
  }


function showPreview(recipeString) {
//	$.ajax({
//		type : "GET",
//		url : "/static/chefkoch2book/templates/recipes/normal/normal.html",
//		success : function (data){buildRecipe(recipeString, data);},
//	});
	buildRecipe(recipeString)
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

function prepareRecipes(chapter) {
	if ('text' in chapter) {
		delete chapter.text;
	}
	if ('nodes' in chapter) {
		for (let i = 0; i<chapter.nodes.length; i++){
			prepareRecipes(chapter.nodes[i]);
		}
	} else {
		if ('images' in chapter) {
			delete chapter.images;
		}
		if ('url' in chapter) {
			delete chapter.text;
		}
	}
}


function buildBook() {
	
	
	let newRecipes = recipes;
	prepareRecipes(newRecipes[0]);
	

	
	var form = $('<form>')
    .attr("method", "POST")
    .attr("action", "/create/render_book/")
    .attr("target", "_blank");
	var input = $("<input>").attr("type", "hidden")
    .attr("name", "jsonData")
    .attr("value", JSON.stringify(newRecipes));
	form.append(input);
	form.append('<input type="hidden" name="csrfmiddlewaretoken" value="'+ csrftoken+'">');
	$('body').append(form);
	
	form.submit();
	
	
}

function buildRecipe(recipeString) {
	
	
	
	// $("#preview-modal").modal("show");
	var titles = getChapterTitles(recipeString);
	var chapterString = titles[0];
	for (let i = 1; i<titles.length; i++) {
		chapterString += " | " + titles[i];
	}
	var recipe = getRecipe(recipeString);
	var pictures = recipe.images;
	recipe["chapter"] = chapterString;
	recipe["ingredientsTable"] = buildIngredientsTable(recipe.ingredients);
	recipe["mainImageUrl"] = recipe.img;
	recipe["bgImageUrl"] = recipe.bg;
	recipe["page"] = "58";

	
	//$.redirect("/create/render_recipe/normal/", recipe, "POST", "_blank", true);

	
	
//	var form = $('<form>')
//    .attr("method", "POST")
//    .attr("action", "/create/render_book/")
//    .attr("target", "_blank");
//	var input = $("<input>").attr("type", "hidden")
//    .attr("name", "jsonData")
//    .attr("value", JSON.stringify(recipe));
//	form.append(input);
//	form.append('<input type="hidden" name="csrfmiddlewaretoken" value="'+ csrftoken+'">');
//	$('body').append(form);
//	
//	form.submit();
	
	showPreview();
	//myWindow.document.write(template(recipe));
}

function showPreview() {
	var form = $('<form>')
    .attr("method", "POST")
    .attr("action", "/create/render_book/")
    .attr("target", "_blank");
	var input = $("<input>").attr("type", "hidden")
    .attr("name", "jsonData")
    .attr("value", JSON.stringify(recipes));
	form.append(input);
	form.append('<input type="hidden" name="csrfmiddlewaretoken" value="'+ csrftoken+'">');
	$('body').append(form);
	
	form.submit();
}

function populateTemplate(myWindow, recipeString) {
	
	// myWindow.document.write("<p>This is 'MsgWindow'. I am 200px wide and
	// 100px tall!</p>");
}

function showRecipeOptionsModal(recipeString) {
	var recipe = getRecipe(recipeString);
	$('#recipe-image-chooser-button').attr("onclick", "showImagePicker('" + recipeString + "', 'img');");
	$('#recipe-bg-chooser-button').attr("onclick", "showImagePicker('" + recipeString + "', 'bg');");
	$('#recipe-img-thumb').attr("src", recipe.img);
	$('#recipe-bg-thumb').attr("src", recipe.bg);
	$("#recipe-options-modal").modal("show");
	
}

function showChapterOptionsModal(chapterString) {
	var chapter = getChapterFromString(chapterString);
	//$('#chapter-bg-chooser-button').attr("onclick", "showChapterImagePicker('" + chapterString + "');");
	$('#chapter-bg-chooser-button').attr("onclick", "showChapterImagePicker('" + chapterString + "');");
	if (chapter.bg != "") {
		$('#chapter-bg-thumb').attr("src", chapter.bg);
	}
	if (chapter.options.recipesBg != "") {
		$('#chapter-recipes-bg-thumb').attr("src", chapter.options.recipesBg);
	}
	$('#chapter_options_modal_save_button').attr("onclick", "saveChapterOptions('" + chapterString + "');$('#chapter-options-modal').modal('hide');");
	$('#use-first-recipe-bg-checkbox').prop("checked", chapter.options.useFirstRecipeBg);
	$('#chapter-recipes-bg').val(chapter.options.recipesBg);
	$('#chapter_bg_url_input').val(chapter.bg);
	$("#chapter-options-modal").modal("show");
	
}

function saveChapterOptions(chapterString) {
	let chapter = getChapterFromString(chapterString);
	
	chapter['bg'] = $('#chapter_bg_url_input').val();
	chapter.options = {useFirstRecipeBg: $('#use-first-recipe-bg-checkbox').prop('checked'),
			recipesBg: $('#chapter-recipes-bg').val()};

	
}

function showChapterImagePicker(chapterString){
	$('#recipe-image-picker').empty();
	for (var i=0;i<bgImages.length; i++) {
		option = '<option data-img-src="' + bgFolder + bgImages[i] + '" value="'+  bgFolder + bgImages[i]  +'"></option>';
		$('#recipe-image-picker').append(option);
	}
	$('#image-chooser-select-button').attr("onclick", "$('#chapter_bg_url_input').val($('#recipe-image-picker').val());$('#chapter-bg-thumb').attr('src', $('#recipe-image-picker').val());$('#image-chooser-modal').modal('hide');");
	$('#recipe-image-picker').imagepicker();
	$("#image-chooser-modal").modal("show");
}

function showImagePicker(path, context){
	$('#recipe-image-picker').empty();
	var recipe = getRecipe(path);
	var option = "";
	for (var i=0;i<recipe['images'].length; i++) {
		option = '<option data-img-src="' + recipe['images'][i] + '" value="'+ recipe['images'][i] +'"></option>';
		$('#recipe-image-picker').append(option);
	}
	$('#image-chooser-select-button').attr("onclick", "saveRecipeImage('" + path + "', $('#recipe-image-picker').val(), '" + context + "');$('#image-chooser-modal').modal('hide');");
	$('#recipe-image-picker').imagepicker();
	$("#image-chooser-modal").modal("show");
}

function saveRecipeImage(recipeString, url, context) {
	var recipe = getRecipe(recipeString);
	if (context == "img") {
		recipe['img'] = url;
	} else {
		recipe['bg'] = url;
	}
	$('#recipe-img-thumb').attr("src", recipe.img);
	$('#recipe-bg-thumb').attr("src", recipe.bg);
}

function saveChapterImage(chapterString, url) {
	let chapter = getChapterFromString(chapterString);
	chapter['bg'] = url;

	$('#chapter-bg-thumb').attr("src", chapter.bg);
}

function handleDrop(e) {
	  // this/e.target is current target element.
	e.preventDefault();  
    e.stopPropagation();


	  // Don't do anything if dropping the same column we're dragging.

	    // Set the source column's HTML to the HTML of the column we dropped on.

	let newLink = e.dataTransfer.getData('URL');
	let links = $('#recipes_url_list').val();
	if (links == "") {
		$('#recipes_url_list').val(newLink);
	} else {
		$('#recipes_url_list').val(links +";" + newLink);
	}
	

	return false;
}



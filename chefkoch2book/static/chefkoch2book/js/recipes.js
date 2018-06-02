var recipes = [{id : "0", title: "Kochbuch", text: 'Kochbuch<a onclick="showChapterModal(\'0\')" href="#" class="recipe-list-button float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i>Kapitel hinzufügen</a>', nodes : []}];

var list_str = ""
	
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
		levels: 2, 
		expandIcon:"fas fa-angle-down",
		collapseIcon:"fas fa-angle-up",
		emptyIcon:"far fa-file-alt",
			
}

$(document).ready(document_ready);	

function document_ready() { 
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", {  silent: true });
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



function createList(item) {
	
	if (item==null) {
		return;
	}
	
		if (item.type == "ch") { // unterchapters durchgehen
			list_str = list_str.concat('<span style="margin: 5px;"><b>" + item.title + "</b></span><ul class="list-group" id="sublist-chapter-" + item.id + "">');
			
			for (var i=0;i<item.content.length;i++){
				list_str = list_str.concat('<li class="list-group-item">');
				createList(item.content[i]);
				list_str =list_str.concat("</li>")
			}
			list_str =list_str.concat("</ul>")
		} else {
			list_str =list_str.concat(item.title);	
		}		
}

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
	var dataText = recipeData.title + '<a onclick="deleteRecipe(\'' + chapterString + '-' + id + '\')" href="#" class="float-right"><i class="fas fa-minus-square fa-lg" style="color: gray"></i></a>';
	recipeData["text"] = dataText;
	recipeData["id"] = id;
	
	chapter["nodes"].push(recipeData);
	chapter["nodes"] = _.sortBy(chapter["nodes"], "title");
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", {  silent: true });
}

function newChapter(title, chapterString){
	var parentChapter = getChapterFromString(chapterString);
	var id = title.hashCode();
	var dataText = title + '<a onclick="showRecipeModal(\'' + chapterString + '-' + id + '\')" href="#" class="recipe-list-button float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i>Rezept</a> <a onclick="showChapterModal(\'' + chapterString + '-' + id + '\')" href="#" class="recipe-list-button float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i>Kapitel</a> <a onclick="deleteChapter(\'' + chapterString + '-' + id + '\')" href="#" class="recipe-list-button float-right"><i class="fas fa-minus-square fa-lg" style="color: gray"></i></a>' ;
	var chapter = {};
	chapter["text"] = dataText;
	chapter["title"] = title;
	chapter["id"] = id;
	chapter["nodes"]=[];
	
	parentChapter.nodes.push(chapter);
	
	parentChapter["nodes"] = _.sortBy(parentChapter["nodes"], "title");
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", {  silent: true });
}

function deleteRecipe(recipeString) {
	var path = recipeString.split("-");
	var chapter = getChapterFromArray(_.first(path,path.length-1));
	//var pathid = path[path.length-1];
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


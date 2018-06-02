var recipes = [{type: "ch", pos: "0", id: "hauptrezepte", title:"Hauptrezepte",text: "Hauptrezepte <a href="#" class="float-right"><i class="fas fa-minus-square"></i></a><a href="#" class="float-right"><i class="fas fa-plus"></i></a>", nodes: [
	                          {type: "ch", id: "backen", title:"Backen", text:"Backen <a onclick="showRecipeModal(\"hauptrezepte-backen\")" href="#" class="float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i></a>", nodes: [
	                        	  {type:"r", text:"Käsekuchen <a onclick="getChapterFromString(\"hauptrezepte-backen\")" href="#" class="float-right">test</a>"},
	                        	  {type:"r", text:"Käsekuchen"},
	                        	  {type:"r", text:"Käsekuchen"},
	                        	  {type:"r", text:"Käsekuchen<b>hhh</b>"}]},
	                          {type: "ch", text:"Backen", nodes: [
	                        	  {type:"r", text:"Käsekuchen"},
	                        	  {type:"r", text:"Käsekuchen"},
	                        	  {type:"r", text:"Käsekuchen"},
	                        	  {type:"r", text:"Käsekuchen"}]}]  },
	           {type: "ch", pos: "0", id: "0", text: "Hauptrezepte", nodes: [
	        	              {type: "ch", text:"Backen", nodes: [
	        	            	  {type:"r", text:"Käsekuchen"},
	        	            	  {type:"r", text:"Käsekuchen"},
	        	            	  {type:"r", text:"Käsekuchen"},
	        	            	  {type:"r", text:"Käsekuchen"}]},
	        	              {type: "ch", text:"Backen", nodes: [
	        	            	  {type:"r", text:"Käsekuchen"},
	        	            	  {type:"r", text:"Käsekuchen"},
	        	            	  {type:"r", text:"Käsekuchen"},
	        	            	  {type:"r", text:"Käsekuchen"}]}]  
	           }];

var list_str = ""
	
String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
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
	$("#recipe-tree").treeview("expandAll", { levels: 2, silent: true });
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
			list_str = list_str.concat("<span style="margin: 5px;"><b>" + item.title + "</b></span><ul class="list-group" id="sublist-chapter-" + item.id + "">");
			
			for (var i=0;i<item.content.length;i++){
				list_str = list_str.concat("<li class="list-group-item">");
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
	var path = chapter.split("-");
	var currentChapter = recipes;
	
	for (var i = 0; i< path.length-1;i++) {
		currentChapter = _.findWhere(currentChapter, {id : path[i]}).nodes;
	}
	currentChapter = _.findWhere(currentChapter, {id : path[i]});
	
	// alert(currentChapter["text"]);
	return currentChapter;
}

function getChapterFromArray(path) {
    var currentChapter = recipes;
	
	for (var i = 0; i< path.length-1;i++) {
		currentChapter = _.findWhere(currentChapter, {id : path[i]}).nodes;
	}
	currentChapter = _.findWhere(currentChapter, {id : path[i]});
	
	// alert(currentChapter["text"]);
	return currentChapter;
}



function showRecipeModal(chapterString) {
	var chapter = getChapterFromString(chapterString);
	$("#modal-title-chapter").text(chapter.title);
	$("#url-list-chapter").val(chapterString);
	$("#recipes-url-modal").modal("show");
}

function addRecipe() {
	var urls = $("#recipes_url_list").val().replace(/\s|\n/g, "").split(";");
	var chapter = $("#url-list-chapter").val();
	for (var i = 0; i< urls.length; i++) {
		getRecipeData(urls[i], chapter);
	}
	// getRecipeData(, $("#url-list-chapter").val());
}

function saveRecipe(recipeData, chapterString){
	var chapter = getChapterFromString(chapterString);
	var id = recipeData.title.hashCode();
	dataText = recipeData.title + '<a onclick="deleteRecipe(\"' + chapterString + '-' +  + '\")" href="#" class="float-right"><i class="fas fa-plus-square fa-lg" style="color: green"></i></a>'
	recipeData["text"] = recipeData.title;
	
	chapter["nodes"].push(recipeData);
	chapter["nodes"] = _.sortBy(chapter["nodes"], "title");
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", { levels: 2, silent: true });
}

function deleteRecipe(recipeString) {
	var path = chapter.split("-");
	var chapter = getChapterFromArray(_.first(path,path.length-1));
	var recipe = _.findWhere(chapter, {id : path[path.length-1]});
	chapter = _.without(chapter, recipe);
	$("#recipe-tree").treeview(tree_view_options); 
	$("#recipe-tree").treeview("expandAll", { levels: 2, silent: true });
}
	








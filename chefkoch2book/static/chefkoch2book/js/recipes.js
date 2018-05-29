var recipes = [{type: "ch", pos: "0", id: "0", title: 'Hauptrezepte', content: [
	                          {type: "ch", title:"Backen", content: [
	                        	  {type:"r", title:"Käsekuchen"},
	                        	  {type:"r", title:"Käsekuchen"},
	                        	  {type:"r", title:"Käsekuchen"},
	                        	  {type:"r", title:"Käsekuchen"}]},
	                          {type: "ch", title:"Backen", content: [
	                        	  {type:"r", title:"Käsekuchen"},
	                        	  {type:"r", title:"Käsekuchen"},
	                        	  {type:"r", title:"Käsekuchen"},
	                        	  {type:"r", title:"Käsekuchen"}]}]  },
	           {type: "ch", pos: "0", id: "0", title: 'Hauptrezepte', content: [
	        	              {type: "ch", title:"Backen", content: [
	        	            	  {type:"r", title:"Käsekuchen"},
	        	            	  {type:"r", title:"Käsekuchen"},
	        	            	  {type:"r", title:"Käsekuchen"},
	        	            	  {type:"r", title:"Käsekuchen"}]},
	        	              {type: "ch", title:"Backen", content: [
	        	            	  {type:"r", title:"Käsekuchen"},
	        	            	  {type:"r", title:"Käsekuchen"},
	        	            	  {type:"r", title:"Käsekuchen"},
	        	            	  {type:"r", title:"Käsekuchen"}]}]  
	           }];

var list_str = ""


//using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

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



function addRecipe(url_str, chapter) {
	
	$.ajax({
		type : 'POST',
		url : '/create/get_recipe_data_json/',
		data : {url: url_str},
		success : function (data){newRecipeData(data, chapter);},
	});
    
}

function createRecipeList() {
	$('#recipe-list').empty();
	for (var i=0;i<recipes.length;i++){
	    createList(recipes[i]);
	    $('#recipe-list').append(list_str);
	    list_str = "";
	}
}



function createList(item) {
	
	if (item==null) {
		return;
	}
	
		if (item.type == "ch") { // unterchapters durchgehen
			list_str = list_str.concat('<span style="margin: 5px;"><b>' + item.title + '</b></span><ul class="list-group" id="sublist-chapter-' + item.id + '">');
			
			for (var i=0;i<item.content.length;i++){
				list_str = list_str.concat('<li class="list-group-item">');
				createList(item.content[i]);
				list_str =list_str.concat('</li>')
			}
			list_str =list_str.concat('</ul>')
		} else {
			list_str =list_str.concat(item.title);	
		}		
}

function newRecipeData(jsonData, chapter) {
	//alert(JSON.stringify(jsonData));
	//recipes.push(jsonData);
	chapters = chapter.split("-");
	currentChapter = recipes;
	for (i=0; i<chapters.length; i++) {
		for (j=0; j<currentChapter.length; j++){
			if (currentChapter.id == chapters[i]){
				currentChapter = currentChapter[chapters[i]];
			}
		}
		
	}
	createRecipeList();
}
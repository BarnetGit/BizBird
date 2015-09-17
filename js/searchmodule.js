var SaveValue = "";
$(function(){
	$(".History").hover(overFunc, outFunc);
});

function overFunc(){
	$(this).css("background-color", "blue");
};

function outFunc(){
	$(this).css("background-color", "white");
};

function treeMenu(tName){
	tMenu = document.all[tName].style;
	if(tMenu.display == 'none') tMenu.display = "block";
	else tMenu.display = "none";
};

function dblclickEv(obj, infoid){
	if(obj.text == $("#reply").text()){
		$("#reply").text("")
		document.getElementById("hiddenNo").value="";
	}else{
		$("#reply").text(obj.text)
		document.getElementById("hiddenNo").value=infoid;
	}
};

function PostSendInfoSearch(){
	var $form = $('#info_search');
	var value = $form.serialize();
	$.post('/info/search', value, function(res){
		DisplayJsonInfoSearch(res);
		SaveValue = res;
	});
	return false;
};

function PostSendMaintenanceSearch(){
	var $form = $('#form_hosyu_search');
	var value = $form.serialize();
	$.post('/maintenance/search', value, function(res, searchtxt){
		DisplayJsonMaintenanceSearch(res, searchtxt);
		SaveValue = res;
	});
	return false;
};

function SortValueInfoSearch(){
	switch($('#SelectSort').val()){
		case "date_asc":
			SaveValue.sort(
				function(a,b){
					a = a["value"];
					b = b["value"];
					var aName = a["createdate"];
					var bName = b["createdate"];
					if( aName < bName ) return -1;
					if( aName > bName ) return 1;
					return 0;
				}
			);
			DisplayJsonInfoSearch(SaveValue);
		break;
		
		case "date_des":
			SaveValue.sort(
				function(a,b){
					a = a["value"];
					b = b["value"];
					var aName = a["createdate"];
					var bName = b["createdate"];
					if( aName < bName ) return 1;
					if( aName > bName ) return -1;
					return 0;
				}
			);
			DisplayJsonInfoSearch(SaveValue);
		break;
		
		case "mark":
			SaveValue.sort(
				function(a,b){
					a = a["value"];
					b = b["value"];
					var aName = a["Info_important"];
					var bName = b["Info_important"];
					var aName2 = a["Info_attention"];
					var bName2 = b["Info_attention"];
					if( aName < bName ) return 1;
					if( aName > bName ) return -1;
					if( aName2 < bName2 ) return 1;
					if( aName2 > bName2 ) return -1;
					return 0;
				}
			);
			DisplayJsonInfoSearch(SaveValue);
		break;
	}
};

function SortValueMaintenanceSearch(){
	switch($('#sort').val()){
		case "date_asc":
			SaveValue.sort(
				function(a,b){
					var aName = a["start_date"];
					var bName = b["start_date"];
					if( aName < bName ) return -1;
					if( aName > bName ) return 1;
					return 0;
				}
			);
			DisplayJsonMaintenanceSearch(SaveValue);
		break;
		
		case "date_des":
			SaveValue.sort(
				function(a,b){
					var aName = a["start_date"];
					var bName = b["start_date"];
					if( aName < bName ) return 1;
					if( aName > bName ) return -1;
					return 0;
				}
			);
			DisplayJsonMaintenanceSearch(SaveValue);
		break;
		
		case "worker":
			SaveValue.sort(
				function(a,b){
					var aName = a["worker"];
					var bName = b["worker"];
					if( aName < bName ) return -1;
					if( aName > bName ) return 1;
					return 0;
				}
			);
			DisplayJsonMaintenanceSearch(SaveValue);
		break;
	}
};

function DisplayJsonMaintenanceSearch(res, txt){
	$("p").text("");
	var obj = document.getElementsByTagName("p").item(0);
	if(res){
		var i = 0;
		for(var json of res){
			console.log(json);
			var content = document.createElement('a');
			content.innerHTML = json.title;
			if(json.content) content.innerHTML += " " + json.content;
			content.innerHTML += "<br>" + json.start_date + " ～ " + json.end_date + " " + json.worker + " ";
			for(var classification of json.classification){
				content.innerHTML += classification + " ";
			}
			content.innerHTML += "<br>"
			content.className = "History";
			content.setAttribute("href", "/maintenance/history/" + json.id);
			obj.appendChild(content);
		}
	}
	$(".History").hover(overFunc, outFunc);
	$('.textbox').removeHighlight().highlight($("#searchtext").val());
};

function DisplayJsonInfoSearch(res){
	$("p").text("");
	var obj = document.getElementsByTagName("p").item(0);
	if(res){
		var i = 0;
		for(var json of res){
			if(json.value.child.length == 0){
				var nottree = document.createElement('a');
				nottree.innerHTML = "・";
				obj.appendChild(nottree);
			}else{
				var tree = document.createElement('a');
				tree.setAttribute("href", "javaScript:treeMenu('tree" + i + "')");
				tree.innerHTML = "■";
				obj.appendChild(tree);
			}
			var important = document.createElement('a');
			var attention = document.createElement('a');
			important.innerHTML = "●";
			attention.innerHTML = "●";
			if(json.value.Info_important == "true"){
				important.className = "circle_important";
			}else{
				important.className = "circle_none";
			}
			if(json.value.Info_attention == "true"){
				attention.className = "circle_attention";
			}else{
				attention.className = "circle_none";
			}
			obj.appendChild(important);
			obj.appendChild(attention);
			var content = document.createElement('a');
			content.innerHTML = json.value.createdate + " " + json.value.Info_title + " " + json.value.Info_content;
			content.className = "History";
			content.setAttribute("href", "/info/history/" + json.value.myID);
			obj.appendChild(content);
			
			var br = document.createElement('br');
			obj.appendChild(br);
			
			var space = "　 ";
			
			var spantree = document.createElement('span');
			spantree.id = "tree" + i;
			spantree.setAttribute("style", "display:none;");
			obj.appendChild(spantree);
			for(var child of json.value.child){
				spantree.innerHTML += space + "┗";
				var childimportant = document.createElement('a');
				childimportant.innerHTML = "●";
				if(child.Info_important == "true"){
					childimportant.className = "circle_important"
				}else{
					childimportant.className = "circle_none"
				}
				spantree.appendChild(childimportant);
				
				var childattention = document.createElement('a');
				childattention.innerHTML = "●";
				if(child.Info_attention == "true"){
					childattention.className = "circle_attention"
				}else{
					childattention.className = "circle_none"
				}
				spantree.appendChild(childattention);
				
				var childcontent = document.createElement('a');
				childcontent.setAttribute("href", "/info/history/" + child.myID);
				childcontent.className = "History";
				childcontent.innerHTML = child.createdate + " " + child.Info_title + " " + child.Info_content;
				spantree.appendChild(childcontent);
				
				var br = document.createElement('br');
				spantree.appendChild(br);
				space += "　 ";
			}
			i++
		}
	}
	$(".textbox").removeHighlight().highlight($("#searchtxt").val());
	$(".History").hover(overFunc, outFunc);
};

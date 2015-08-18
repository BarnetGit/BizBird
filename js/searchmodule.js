$(function(){
	
	$(".History").hover(overFunc, outFunc);
	
	function overFunc(){
		$(this).css("background-color", "blue");
	};
	
	function outFunc(){
		$(this).css("background-color", "white");
	};
});

function treeMenu(tName){
	tMenu = document.all[tName].style;
	if(tMenu.display == 'none') tMenu.display = "block";
	else tMenu.display = "none";
};
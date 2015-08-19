function delete(formname){
	var f = document.forms[formname];
	f.method = "POST";
	f.action = ("/maintenance/history/delete");
	f.submit();
};

function test(){
	alert("aaa");
};
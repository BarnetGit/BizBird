function deletedoc(formname){
	var res = confirm("本当に消していいですか？");
	if(res){
		var f = document.forms[formname];
		f.method = "POST";
		f.action = ("/maintenance/history/delete");
		f.submit();
	}
};

function deletedoc(formname){
	var res = confirm("�{���ɏ����Ă����ł����H");
	if(res){
		var f = document.forms[formname];
		f.method = "POST";
		f.action = ("/maintenance/history/delete");
		f.submit();
	}
};

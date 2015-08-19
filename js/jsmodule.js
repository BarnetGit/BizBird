function deletedoc(formname){
	var res = confirm("ñ{ìñÇ…è¡ÇµÇƒÇ¢Ç¢Ç≈Ç∑Ç©ÅH");
	if(res){
		var f = document.forms[formname];
		f.method = "POST";
		f.action = ("/maintenance/history/delete");
		f.submit();
	}
};

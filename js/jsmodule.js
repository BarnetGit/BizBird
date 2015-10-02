function deletedoc(formname, url){
	var res = confirm("本当に消していいですか？");
	if(res){
		var f = document.forms[formname];
		f.method = "POST";
		f.action = (url);
		f.submit();
	}
};

$(function() {
  $.datepicker.setDefaults($.datepicker.regional['ja']);
  $('#datepickers').datepicker({ dateFormat: 'yy-mm-dd' });
  $('#datepickere').datepicker({ dateFormat: 'yy-mm-dd' });
});
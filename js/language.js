var languageScript;

$(function(){
  // add language file and convert words
  appendLanguageScript();
  convertLanguage();

  // test
	$('body').on('click', '#test_button_ja' , function() {
    languageScript.remove();
    lang = "ja";
    appendLanguageScript();
		convertLanguage();
	});
  
	$('body').on('click', '#test_button_en' , function() {
    languageScript.remove();
    lang = "en";
    appendLanguageScript();
		convertLanguage();
	});
});

function appendLanguageScript()
{
  languageScript = $('<script>').attr({
    'type': 'text/javascript',
    'src': './language/'+lang+'.js'
  });
  $('body').append(languageScript);
}

function convertLanguage()
{
  for (let key in languageList) {
    $('.'+key).text(languageList[key]);
  }
}
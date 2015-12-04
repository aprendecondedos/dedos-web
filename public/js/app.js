$(function(){
  /**
   * Inicialización de plugins
   */

  //$('[data-plugin="maxlength"]').maxlength();

  //if($('[data-plugin="switchery"]').length > 0) {
  //  $('[data-plugin="switchery"]').each(function(){
  //    new Switchery(this, {color: '#62a8ea'});
  //  });
  //}

  $('[data-name].profile').initial({
    charCount: 2
  });
  $('[data-name].classroom').initial({
    charCount: 1
  });
  // affixHandler
  $('#articleAffix').affix({
    offset: {
      top: 210
    }
  });
  $('body').scrollspy({
    target: '#articleAffix'
  });
});
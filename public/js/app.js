$(function(){
  /**
   * Inicialización de plugins
   */

  $('[data-plugin="maxlength"]').maxlength();

  $('[data-name].profile').initial({
    charCount: 2
  });

});
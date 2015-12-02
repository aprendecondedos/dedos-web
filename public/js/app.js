$(function(){
  /**
   * Inicialización de plugins
   */

  $('[data-plugin="maxlength"]').maxlength();

  new Switchery($('[data-plugin="switchery"]')[0], { color: '#62a8ea' });

  $('[data-name].profile').initial({
    charCount: 2
  });

});
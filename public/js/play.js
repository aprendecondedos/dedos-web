(function(window, document, $) {
  'use strict';
  var $doc = $(document);
  $.play = $.play || {};
  $.extend($.play, {
    defaults: {
      container: '.play',
      modals: {
        select_player: '#modal-select-player'
      }
    },
    init: function() {
      console.log('loaded');
    }
  });
  var $user = '';
  var $select_player = $('#modal-select-player');
  var $play = $('.play');

  //$(document).on('click', '.select-activity', function(e) {
  //  e.preventDefault();
  //  var url_data = $(this).attr('href');
  //  $.ajax({
  //    type: 'GET',
  //    url: url_data,
  //    success: function(html) {
  //      $play.html(html);
  //    }
  //  });
  //});

  console.log('{{req.project}}');

})(window, document, jQuery);

(function() {
  // Play Constructor
  this.Play = function() {
    // Opciones por defecto
    var defaults = {
      project: '',
      user: {
        id: '',
        name: ''
      },
      room: '',
      container: '.play',
      modals: {
        select_player: '#modal-select-player'
      }
    };
    this.options = defaults;
    // Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === 'object') {
      this.options = $.extend(defaults, arguments[0]);
    }
    var $container = $(this.options.container);
    var $select_player = $(this.options.modals.select_player);
    var self = this;

    /**
     * Actividad
     */
    $(document).on('click', '.select-activity', function(e) {
      e.preventDefault();
      var url_data = $(this).attr('href');
      $.ajax({
        type: 'GET',
        url: url_data,
        success: function(html) {
          $container.html(html);
          socket.emit('server project:activity:join', {room: self.options.room, id: self.options.user.id});
        }
      });
    });

    console.log(this.options);
  };
}());
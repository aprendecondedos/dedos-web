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
      id: '',
      project: '',
      player: {
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
     * Urls
     * @type {string}
     */
    var url_play = '/play/' + self.options.id;
    /**
     * Sockets
     */
    var sockets = {};
    /**
     * Actividad
     */

    // Sockets
    sockets.activity = {
      join: 'server project:activity:join'
    };
    // Eventos
    $(document).on('click', '.select-activity', function(e) {
      e.preventDefault();
      //var url_data = $(this).attr('href');
      var activity_id = this.id;
      var activity_num = $(this).data('num');
      var url_data = url_play + '/activity/' + activity_id;
      $.ajax({
        type: 'GET',
        url: url_data,
        success: function(html) {
          $container.html(html);
          $container.attr('data-context', activity_id);
          // SOCKET emit
          socket.emit(sockets.activity.join, {
            room: self.options.room,
            activity: activity_id,
            status: activity_num,
            player: self.options.player
          });
        }
      });
    });

    $(document).on('click', '.token-clickable', function(e) {
      var token_id = this.id;
      var element_id = $(this).data('element');
      var activity_id = $container.data('context');
      $.ajax({
        type: 'POST',
        url: url_play + '/activity/' + activity_id + '/check',
        data: {
          token_id: token_id,
          element_id: element_id
        },
        success: function(html) {
          console.log(html);
        }
      });
      socket.emit('event:click:token', {id: element_id});
    });

    console.log(this.options);
  };
}());
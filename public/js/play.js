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
      width: '',
      height: '',
      player: {
        id: '',
        name: ''
      },
      properties: {
        delayed: false
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
     * Elements
     * @type {{}}
     */
    var elements = this.elements = {};

    elements.load = function() {
      elementsAdjustSize();
      console.log('CARGADO!');
    };
    /**
     * Funciones privadas de elements
     */
    function elementsAdjustSize(){
      var $elements = $container.find('.element');
      var res = {
        width: $container.find('.play-table').innerWidth(),
        height: $container.find('.play-table').height()
      };
      var coefficient = {
        x: (res.width * 1) / self.options.width,
        y: (res.height * 1) / self.options.height
      };
      $elements.hide();
      $elements.each(function() {
        $(this).css({
          'left': ($(this).data('position').x) * coefficient.x,
          'top': ($(this).data('position').y) * coefficient.y,
          'width': ($(this).data('size').width) * coefficient.x,
          'height': ($(this).data('size').height) * coefficient.y
        });
        $(this).fadeIn('fast');
      });
    }
    $(window).on('resize', elementsAdjustSize);

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
          // Renderizado de elementos/tokens
          self.elements.load();
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
    // Función para comprobar respuestas en caso de demorada
    $(document).on('click', '.checkBtn', function(e) {
      var sendingTokens = {
        token_id: [],
        element_id: []
      };
      $('.clicked').each(function(token){
        sendingTokens.token_id.push($(this).data('element'));
        sendingTokens.element_id.push($(this).attr('id'));
      });
      $.ajax({
        type: 'POST',
        url: url_play + '/activity/' + activity_id + '/check',
        data: sendingTokens,
        success: function (html) {
          console.log(html);
          html.tokens.forEach(function(token) {
            if (token.result) {
              $('#' + token.token_id).css({
                'border-color': 'green',
                'border-width': '15px'
              });
            }else{
              $('#' + token.token_id).css({
                'border-color': 'red',
                'border-width': '15px'
              });
            }
          });
        }
      });
      console.log(sendingTokens);
    });

    $(document).on('click', '.token-clickable', function(e) {
      var token_id = this.id;
      var element_id = $(this).data('element');
      var activity_id = $container.data('context');
      console.log('Opciones' + self.options.properties.delayed);
      if(!self.options.properties.delayed) {
        socket.emit('event:click:token', {id: element_id});
        $.ajax({
          type: 'POST',
          url: url_play + '/activity/' + activity_id + '/check',
          data: {
            token_id: [token_id],
            element_id: [element_id]
          },
          success: function (html) {
            console.log(html);
            html.tokens.forEach(function(token) {
              if (token.result) {
                $('#' + token.token_id).css({
                  'border-color': 'green',
                  'border-width': '15px'
                });
              } else {
                $('#' + token.token_id).css({
                  'border-color': 'red',
                  'border-width': '15px'});
              }
            });
          }
        });

      }else {
        $('#' + token_id).addClass($('#' + token_id).attr('class') + ' clicked');
        //console.log($("#"+token_id).attr("class"));
        console.log($('.clicked'));

      };
    });

    console.log(this.options);
  };

}());
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
        delayed: false,
        required: false
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
    var $document = $(document);
    var $container = $(this.options.container);
    var $select_player = $(this.options.modals.select_player);
    var self = this;
    /**
     * Urls
     *
     * @type {string} url_play
     */
    var url_play = '/play/' + self.options.id;
    /**
     * Propiedades de la actividad
     *
     * @type {Object} activity
     */
    var activity = this.activity = {};
    /**
     * Listado de sockets disponibles
     *
     * @type {Object} sockets
     */
    var sockets = {};
    /**
     * Propiedades de los elementos
     *
     * @type {Object} elements
     */
    var elements = this.elements = {};
    /**
     * Tokens incluido en elementos
     *
     * @type {Object} tokens
     */
    var tokens = this.elements.tokens = {};
    /**
     * Añade propiedades a la clase
     *
     * @param {(Object|String[])} arguments
     */
    this.setOption = function() {
      if (arguments[0] && typeof arguments[0] === 'object') {
        var properties = arguments[0];
      } else {
        var properties = {};
        properties[arguments[0]] = arguments[1];
      }
      this.options = $.extend(this.options, properties);
    };
    /**
     * Obtiene una propiedad de la clase
     *
     * @param {String} property Propiedad de la clase
     * @returns {*}
     */
    this.getOption = function(property) {
      return this.options[property];
    };
    /**
     * Carga de una actividad
     *
     * @param {Object} activity_data
     * @property {Number} activity.id Identificador de la actividad
     * @property {Number} activity.num Número natural de la actividad
     * @property {String} activity.url Dirección URL
     */
    activity.load = function(activity_data) {
      // Se necesita tener el jugador seleccionado
      if (self.options.player.id.length == 0) {
        return false;
      }
      // Se inicia las variables relacionadas
      // con la actividad
      activity.id = activity_data.id;
      activity.num = activity_data.num;
      activity.url = url_play + '/activity/' + activity.id;
      $.ajax({
        type: 'GET',
        url: activity.url,
        success: function(html) {
          $container.html(html);
          $container.attr('id', activity.id);
          // Renderizado de elementos/tokens
          self.elements.load();
          // @TODO
          $container.find('.token-movable').draggable({
            revert: false,
            cursor: 'move',
            //opacity: 0.7,
            helper: 'clone',
            drag: function(event, ui) {
              $(this).css('opacity', 0.3);
            },
            stop: function(event, ui) {
              $(this).css('opacity', 1);
            }
          });
          //$container.find('.tokenMeter').attr('data-currentValue',0);
          $('.token-droppable').droppable({
            drop: function(event, ui) {
              //$container.find('.token-target').droppable({
              //  drop: function(event, ui) {
              //    $(this).afster($(ui.draggable).clone());
              //    $(this).addClass('checked correct');
              //    $(this)
              //      .addClass( "ui-state-highlight" );
              //    ui.draggable.draggable('option', 'revert', false);
              elements.tokens.check({
                data: {
                  id: ui.draggable.context.id,
                  name: $container.find(
                      '#' + ui.draggable.context.id).data('element'),
                  value: $container.find(
                      '#' + ui.draggable.context.id).data('value')
                },
                area_id: $container.find(
                  '#' + ui.draggable.context.id).parent().data('element'),
                droppedInto: {
                  id: event.target.id,
                  name: $container.find('#' + event.target.id)
                      .data('element'),
                  currentValue: $container.find('#' + event.target.id)
                    .attr('data-currentvalue')
                }
              });
              $(this).addClass('ui-state-highlight');
            }
          });
          // Se emite un socket incluyendo información relacionada con la actividad y jugador
          socket.emit(sockets.activity.join, {
            room: self.options.room,
            activity: activity.id,
            status: activity.num,
            player: self.options.player
          });
        }
      });
    };
    /**
     * Comprobación si la actividad esta correcta
     * dado un listado de tokens que pertenece a la actividad
     *
     */
    activity.check = function() {
      var tokens_array = [];
      $container.find('.clicked').each(function() {
        var area_data = {};
        // Si pertenece a un area, se obtiene sus propiedades
        if ($(this).parent('.area').length > 0) {
          area_data = $(this).parent('.area').data('element');
        }
        tokens_array.push({
          data: {
            id: $(this).attr('id'),
            name: $(this).data('element')
          },
          area_id: area_data
        });
      });
      // Se recorre todos los elementos que han sido arrastrados y soltados
      $container.find('.dropped').each(function() {
        tokens_array.push({
          data: {
            id: $(this).attr('id'),
            name: $(this).data('element'),
            value: $(this).data('value')
          },
          area_id: $(this).parent().data('element'),
          droppedInto: {
            id: $(this).data('droppedin'),
            name: $container.find('#' + $(this).data('droppedin'))
                .data('element'),
            currentValue: $container.find('#' + $(this).data('droppedin'))
              .attr('data-currentvalue')
          }
        });
      });
      if (tokens_array.length == 0) {
        return false;
      }
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: activity.url + '/check',
        data: {tokens: tokens_array},
        success: function(data) {
          for (var key in data.tokens) {
            $container.find('#' + data.tokens[key].id).addClass(function() {
              if (data.tokens[key].valid) { return 'correct checked'; } else { return 'wrong checked'; }
            });
            console.log(data.tokens[key].value);
            if (data.tokens[key].value) {
              $container.find('[data-element=' + data.tokens[key].targetName + ']').attr(
                'data-currentvalue', data.tokens[key].value);
            }
          }
          /* Ejecuta esta parte porque la opción de respuesta demorada está activa,
          por lo que automáticamente la actividad se dará por terminada una vez el usuario de sus respuestas
           */
          /*Por tanto, sólo tenemos que comprobar si ha resuelto la actividad correctamente o no y contrastarlo con
           la opción dónde se establece si se requiere éxito o no en la respuesta
            */
          /* La ejecución será diferente dependiendo de si se hace por turnos o no.
          Por ejemplo: Si hay turnos, el usuario no podrá avanzar a la siguiente actividad hasta
          que todos los jugadores hayan completado dicha actividad.
           */
          if (self.options.required) {
            if (data.activity.finished && data.activity.valid) {
              disableElements();
                 // Permitimos que el usuario navegue a la siguiente actividad
            } else {
              disableElements();
              /* El usuario no ha completado la actividad con éxito por lo que se le mostraría un botón
              para reiniciar la actividad */
            }
          } else {
            disableElements();
            /* El usuario ha contestado y no nos interesa si las respuestas que ha dado son correctas o no
            por lo que le permitimos avanzar a la siguiente actividad
             */
          }
        }
      });
    };
    /**
     * Carga de los elementos
     */
    elements.load = function() {
      elementsAdjustSize();
      // stuff
    };
    /**
     * Comprobación por AJAX del token
     *
     * @param {Object} token
     * @property {Number} token.id Identificador dada por la BD
     * @property {Number} token.element Identificador nativo del token
     * @property {Number} token.targetId Identificador del objeto sobre el que ha sido arrastrado
     * @property {Boolean} token.checked Comprobador si el token ya ha sido seleccionado
     */
    tokens.check = function(token) {

      //console.log('ESTO SE PASA: ' + $container.find('#' + token.droppedInto.id).data('currentvalue'));
      //console.log($container.find('#' + token.droppedInto.id).attr('data-currentvalue'));
      if (self.options.properties.delayed) {
        if (token.droppedInto) {
          $container.find('#' + token.data.id).addClass('dropped');
          $container.find('#' + token.data.id).attr('data-droppedin',token.droppedInto.id);
        }else {
          $container.find('#' + token.data.id).toggleClass('clicked');
        }
      // Se comprueba si ya se ha comprobado el token
      } else if (token.data.checked) {
        return false;
      } else {
        // Se emite un socket con la información del token
        console.log(token);
        socket.emit('event:click:token', {id: token.element});
        $.ajax({
          type: 'POST',
          dataType: 'json',
          url: activity.url + '/check',
          data: {
            tokens: [token]
          },
          success: function(data) {
            //var token_data = data.tokens;
            console.log(data.tokens);
            for (var key in data.tokens) {
              $container.find('#' + data.tokens[key].id).addClass(function() {
              if (data.tokens[key].valid) { return 'correct checked'; } else { return 'wrong checked'; }
            });
              if (data.tokens[key].value) {
                $container.find('[data-element=' + data.tokens[key].targetName + ']').attr(
                  'data-currentvalue', data.tokens[key].value);
              }
            };
            if (self.options.required) {
              if (data.activity.finished) {
                if (data.activity.valid) {
                  // Permitimos que el usuario navegue a la siguiente actividad
                  disableElements();
                } else {
                  disableElements();
                  /* El usuario ha contestad mal a la actividad por lo que hay que mostrarle un botón
                  para que la reinicie.
                   */
                }
              } else {
                /* Si no ha terminado la actividad puede seguir haciéndola*/
              }
            } else {
              if (data.activity.finished) {
                disableElements();
                /* El usuario ha terminado la actividad y no nos interesa si ha contestado bien o mal
                por lo que le permitimos avanzar a la siguiente actividad.
                 */
              }
            }

          }
        });
      };
    };
    function disableElements() {
      $container.find('.token-clickable').toggleClass('token-clickable');
      var disabled = $('.token-movable').draggable('option', 'disabled');
      $container.find('.token-movable').draggable('option', 'disabled', !disabled);
    }

    /**
     * Ajuste de la resolución en tamaño y posición de un elemento
     */
    function elementsAdjustSize() {
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

    // Sockets
    sockets.activity = {
      join: 'server project:activity:join'
    };
    // Eventos

    // Función para comprobar respuestas en caso de demorada
    $document.on('click', '#check-activity', activity.check);

    $document.on('click', '.select-activity', function(e) {
      e.preventDefault();
      activity.load({
        id: $(this).data('activity'),
        num: $(this).data('num')
      });
    });

    $document.on('click', '.token-disable', function(e) {
      alert('Hola');
      e.preventDefault();
      return false;
    });

    $document.on('click', '.token-clickable', function() {
      elements.tokens.check({
        data: {
          id: $(this).attr('id'),
          name: $(this).data('element'),
          checked: $(this).hasClass('checked')
        },
        area_id:  $(this).parent().data('element')
      });
    });

    return this;
    console.log(this.options);
  };
}());

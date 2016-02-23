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
        failNotAllowed: false,
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
     * Respuestas incluido en actividad
     *
     * @type {Object} answer
     */
    var answer = this.activity.answers = {};
    answer.setProperties = function(data) {
      $.extend(answer, {
        id: data._id,
        url: url_play + '/answer/' + data._id
      });
    };
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
          var helper = 'original';
          var revert = true;
          opacity = 1;
          if (self.options.properties.failNotAllowed) {
            helper = 'clone';
            revert = false;
            opacity = 0;
          }
          // @TODO
          var activity_result = $container.find('.game').data('activity-result');
          activity.valid = activity_result.valid;
          if (activity_result.finished) {
            activity.setFinished();
          }
          var answer_data = $container.find('.game').data('answer');
          if (answer_data) {
            answer.setProperties({_id: answer_data});
          }

          $container.find('.token-movable').draggable({
            //revert: true, //if self.options.failpermitted { revert == true } else { revert == false }
            revert: true,
            containment: $('.play-table'),
            cursor: 'move',
            zIndex: 2500,
            //opacity: 0.7,
            helper: 'original',
            drag: function(event, ui) {
              $container.find('.token').not('.token-droppable').css('opacity', .6);
              $(this).css('opacity', 1);
              //jsPlumb.repaint($(this));
            },
            stop: function(event, ui) {
              $container.find('.token').not('.token-droppable').css('opacity', 1);
              $(this).css('opacity', 1);
            }
          });
          //$container.find('.tokenMeter').attr('data-currentValue',0);
          $container.find('.token-droppable').droppable({

            drop: function(event, ui) {
              $(ui.draggable.context).addClass('dragged');
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
              jsPlumb.repaint(ui.draggable.context.id);
              $(this).addClass('ui-state-highlight');
              $(this).removeClass('token-droppable-over');
            },
            out: function() {
              $(this).removeClass('token-droppable-over');
            },
            over: function(event, ui) {
              $(this).addClass('token-droppable-over');
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
      console.log(tokens_array);
      if (tokens_array.length == 0) {
        return false;
      }
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: activity.url + '/check',
        data: {
          tokens: tokens_array,
          properties: self.options.properties
        },
        success: function(data) {
          for (var key in data.tokens) {
            if (data.tokens[key].type == 'sel') {
              $container.find('#' + data.tokens[key].id).addClass(function() {
                if (data.tokens[key].valid) {
                  return 'correct checked';
                } else {
                  return 'wrong checked';
                }
              });
            }else if (data.tokens[key].type == 'pair') {
              if (data.tokens[key].valid) {
                $container.find('#' + data.tokens[key].id).hide();//draggable('option', 'disabled', true);
              }
            }
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
          activity.valid = data.activity.valid;
          answer.setProperties(data.answer);

          console.log('Objetivos');
          console.log(data.activity.objectivesNotDone);
          pointObjectivesNotDone(data.activity.objectivesNotDone);
        }
      });
    };

    activity.setFinished = function() {
      activity.check();
      activity.finished = true;
      if (activity.valid) {
        $container.find('.activity-valid').fadeIn();
        $container.find('#next-activity').removeClass('disabled');
      } else {
        if (self.options.properties.required) {
          $container.find('#restart-activity').removeClass('disabled');
        } else {
          pointObjectivesNotDone(data.activity.objectivesNotDone);
        }
        $container.find('.activity-wrong').fadeIn();
        if (self.options.properties.required) {
          /** No se permite avanzar a la siguiente actividad
           * y el usuario tendría que resetear la actividad
          */
        } else {
          $container.find('#next-activity').removeClass('disabled');
        }
      }
      elements.disable();
    };

    activity.restart = function() {
      $.ajax({
        type: 'DELETE',
        url: answer.url,
        success: function(data) {
          if (data) {
            activity.load({
              id: activity.id,
              num: activity.num
            });
          }
        }
      });
    };
    /**
     * Inicialización de elementos
     */
    elements.load = function() {
      elements.adjustSize();
      elements.connect();
      // stuff
    };
    /**
     * Ajuste de la resolución en tamaño y posición de un elemento
     */
    elements.adjustSize = function() {
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
    };
    $(window).on('resize', self.elements.load);
    elements.disable = function() {
      $container.find('.token-clickable').toggleClass('token-clickable');
      $container.find('.token-movable').draggable('option', 'disabled');
    };
    /**
     * Comprobación si existiera conexión entre un elemento y un target
     */
    elements.connect = function() {
      $container.find('.token-movable[data-connect]').each(function() {
        var data = $(this).data('connect');
        console.log(data);
        connect($('#' + data.origin), $('#' + data.target));
      });
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
        socket.emit('event:click:token', {id: token.element});
        $.ajax({
          type: 'POST',
          async: false,
          dataType: 'json',
          url: activity.url + '/check',
          data: {
            tokens: [token],
            properties: self.options.properties
          },
          success: function(data) {
            //var token_data = data.tokens;
            for (var key in data.tokens) {
              if (data.tokens[key].type == 'sel') {
                $container.find('#' + data.tokens[key].id).addClass(function() {
                  if (data.tokens[key].valid) {
                    return 'correct checked';
                  } else {
                    return 'wrong checked';
                  }
                });
              }else if (data.tokens[key].type == 'pair') {

                if (data.tokens[key].valid) {
                  $container.find('#' + data.tokens[key].id).draggable('option', 'revert', false);
                  $container.find('#' + data.tokens[key].id).hide();
                  //$container.find('#' + data.tokens[key].id).css('opacity',0);
                } else {
                  //$container.find('#' + data.tokens[key].id).css('opacity',1);
                }
              } else if (data.tokens[key].type = 'tokenMeter') {
                $container.find('[data-element=' + data.tokens[key].targetName + ']').attr(
                  'data-currentvalue', data.tokens[key].value);
                if (data.tokens[key].valid) {
                  $container.find('#' + data.tokens[key].id).hide();
                } /*else {
                  $container.find('#' + data.tokens[key].id).css('opacity',1);
                }*/
              }
            };
            activity.valid = data.activity.valid;
            answer.setProperties(data.answer);

            if (self.options.properties.required) {
              if (data.activity.finished) {
                activity.setFinished();
                disableElements();
              } else {
                /* Si no ha terminado la actividad puede seguir haciéndola*/
              }
            } else {
              if (data.activity.finished) {
                activity.setFinished();
                disableElements();
                console.log('busca objetivos no hechos');
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
      //$container.find('.token-movable').draggable('option', 'disabled', !disabled);
    }

    function pointObjectivesNotDone(objectives) {
      console.log(objectives);
      const paintStyle = [{fillStyle: 'blue', strokeStyle: 'blue', lineWidth: 1},
        {fillStyle: 'green', strokeStyle: 'green', lineWidth: 1},
        {fillStyle: 'red', strokeStyle: 'red', lineWidth: 1}];
      const lineStyle = [{strokeStyle: 'blue', lineWidth: 7},
        {strokeStyle: 'green', lineWidth: 7},
        {strokeStyle: 'red', lineWidth: 7}];
      var lineStyleTargets = [];
      var paintStyleTargets = [];
      var index = 0;
      objectives.forEach(function(objective) {
        if (objective.type == 'sel') {
          $container.find('[data-element=' + objective.obj + ']').addClass('correct checked');
        } else if (objective.type == 'pair') {
          objective.targets.forEach(function(target) {
            $container.find('[data-element=' + objective.origen + ']').draggable({
              stop: function(event, ui) {
                if (!paintStyleTargets[target]) {
                  paintStyleTargets[target] = paintStyle[index];
                  lineStyleTargets[target] = lineStyle[index];
                  index++;
                }
                connect(
                  $container.find('[data-element=' + objective.origen + ']').attr('id'),
                  $container.find('[data-element=' + target + ']').attr('id'),
                  paintStyleTargets[target],
                  lineStyleTargets[target]
                );
              }
            });
            if (!$container.find('[data-element=' + objective.origen + ']').hasClass('dragged')) {
              if (!paintStyleTargets[target]) {
                paintStyleTargets[target] = paintStyle[index];
                lineStyleTargets[target] = lineStyle[index];
                index++;
              }
              connect(
                $container.find('[data-element=' + objective.origen + ']').attr('id'),
                $container.find('[data-element=' + target + ']').attr('id'),
                paintStyleTargets[target],
                lineStyleTargets[target]
              );
            }
          });
        }
      });

    }

    function connect(id1, id2, paintStyle, lineStyle) {
      jsPlumb.makeTarget($('.element'), {
        anchor: 'Continuous',
      });

      var e1 = jsPlumb.addEndpoint(id1, {
        //connectionType:"basic",
        anchor: 'Top',
        paintStyle: paintStyle,
        endpointStyle: paintStyle,
        isSource: true
      });

      var e2 = jsPlumb.addEndpoint(id2, {
        isTarget: true,
        anchor: 'Bottom',
        endpoint: 'Blank'
      });

      jsPlumb.ready(function() {
        jsPlumb.connect({
          source: e1,//id1,
          target: e2,//id2,
          detachable: false,
          overlays: [
            ['Arrow' , {width: 25, length: 25, location: 0.99}]
          ],
          paintStyle: lineStyle//{strokeStyle: 'green', lineWidth: 7},
        });
      });

    }

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

    // Reinicio de una actividad
    $document.on('click', '#restart-activity', activity.restart);

    return this;
    console.log(this.options);
  };
}());

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
        required: false,
        numPlayers: 0
      },
      room: '',
      container: '.play',
      modals: {
        select_player: '#modal-select-player',
        project_finished: '#modal-finished-project'
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
     * Sockets
     *
     * @type {Object} sockets
     */
    var _sockets = {};
    _sockets.activity = {
      join: 'project:activity:join',
      finished: 'project:activity:finished'
    };
    _sockets.group = {
      timeout: 'group:timeout'
    };
    _sockets.token = {
      action: 'token:action'
    };
    _sockets.player = {
      connected: 'project:player:connected'
    };
    /**
     * Funcios estática para añadir un prefijo por cada valor del objeto
     * @param {Object} obj
     * @param {String} prefix
     * @returns {*}
     */
    var addPrefixValue = function(obj, prefix) {
      if (typeof obj !== 'object' || !obj) {
        return false;
      }
      var objk = Object.keys(obj);
      var prefix = prefix || '';

      for (var i = 0; i < objk.length; i++) {
        if (typeof obj[objk[i]]  === 'object') {
          addPrefixValue(obj[objk[i]], prefix);
        } else {
          obj[objk[i]] = prefix + ' ' + obj[objk[i]];
        }
      }
      return obj;
    };
    var sockets = {};
    sockets.client = addPrefixValue($.extend(true, {}, _sockets), 'client');
    sockets.server = addPrefixValue($.extend(true, {}, _sockets), 'server');

    /**
     * Generador de colores RGB
     *
     * @returns {string}
     */
    var randomColor = function() {
      return (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256));
    };
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
    /**ac
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
          var answer_data = $container.find('.game').data('answer');
          if (answer_data) {
            answer.setProperties({_id: answer_data});
          }
          var group_data = $container.find('.game').data('group');
          if (group_data) {
            self.setOption('player', $.extend(self.options.player, {
              group: {
                id: group_data.id,
                finished: group_data.finished,
              }
            }));
          }
          if (activity_result.finished) {
            activity.setFinished();
          }

          $container.find('.token-movable').draggable({
            //revert: true, //if self.options.failpermitted { revert == true } else { revert == false }
            revert: !self.options.properties.delayed,
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
              }, true);
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
          socket.emit(sockets.server.activity.join, {
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
          var index = 0;
          for (var key in data.tokens) {
            if (data.tokens[key].type == 'sel') {
              var valid = new String();
              if (data.tokens[key].valid) {
                valid = 'correct checked';
              } else {
                valid = 'wrong checked';
              }
              $container.find('#' + data.tokens[key].id).addClass(valid);

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
                if (!$container.find('.game').data('activity-result').finished) {
                  $container.find('#' + data.tokens[key].id).hide();
                }
              } /*else {
               $container.find('#' + data.tokens[key].id).css('opacity',1);
               }*/
            }

            var sendInfo = {
              tokens: tokens_array,
              room: self.options.room,
              group: self.options.player.group ? self.options.player.group.id : undefined,
              player: self.options.player.id
            };
            socket.emit('server token:action', sendInfo);

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
          activity.setFinished(data);
          disableElements();
          //pointObjectivesNotDone(data.activity.objectivesNotDone);
        }
      });
    };

    activity.setFinished = function(data) {
      if (!data) {
        if (activity.valid) {
          $container.find('.activity-valid').fadeIn();
        } else {
          $container.find('.activity-wrong').fadeIn();
        }
        if (!self.options.properties.required) {
          activity.check();
        }
      } else {
        activity.finished = true;
        if (activity.valid) {
          $container.find('.activity-valid').fadeIn();
          $container.find('#next-activity').removeClass('disabled');
        } else {
          $container.find('.activity-wrong').fadeIn();
          if (self.options.properties.required) {
            /** No se permite avanzar a la siguiente actividad
             * y el usuario tendría que resetear la actividad
             */
            $container.find('#restart-activity').removeClass('disabled');
          } else {
            /** El usuario ha contestado correcvtamente
             * por lo que puede acceder a la siguiente actividad
             **/
            if (data) {
              pointObjectivesNotDone(data.activity.objectivesNotDone);
            }
            $container.find('#next-activity').removeClass('disabled');
          }
        }
        // Se finaliza el juego mostrando un modal al usuario
        if (!$container.find('#next-activity').attr('href')) {
          $(self.options.modals.project_finished).modal({show: true, keyboard: false, backdrop: 'static'});
        }
      }
      //Si turnos está activado se emite un socket para comprobar el estado del grupo y a quien le toca interactuar

      if (self.options.properties.turns) {
        if (self.options.player.group.finished === false) {
          // Socket emit
          //setTimeout(sockets.sendTurn, 7200000);
          socket.emit(sockets.server.activity.finished, {
            room: self.options.room,
            activity: activity.id,
            numPlayers: self.options.properties.numPlayers,
            player: self.options.player
          });
          setTimeout(sockets.timeOut, 12000);
        }
      }
      elements.disable();
    };

    sockets.timeOut = function() {

      if (self.options.player.group.finished == false) {
        socket.emit(sockets.server.group.timeout, {
          room: self.options.room,
          activity: activity.id,
          numPlayers: self.options.properties.numPlayers,
          player: self.options.player
        });
      }
      self.options.player.group.finished = true;
      self.player.setActive(true);
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
      //jsPlumb.detachEveryConnection();
      jsPlumb.deleteEveryEndpoint();
      elements.adjustSize();
      elements.connect();
      // stuff
    };
    /**
     * Ajuste de la resolución en tamaño y posición de un elemento
     */
    elements.adjustSize = function() {
      var $elements = $container.find('.element');
      var $tokens = $('.element').find('.text-center');
      $tokens.each(function() {
        var compressor = 1;
        if ($(this).context.offsetWidth > 0) {
          if ($(this).context.offsetWidth < 150 && $(this).context.offsetHeight < 150) {
            compressor = 1.5;
          } else {
            compressor = 0.8;
          }
          $(this).fitText(compressor, {minFontSize: '7px', maxFontSize: '24px'});
        }
      });
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
      $container.find('.token-movable').draggable('option', 'disabled',true);
    };
    /**
     * Comprobación si existiera conexión entre un elemento y un target
     */
    elements.connect = function() {
      $container.find('.token-movable[data-connect]').each(function() {
        var data = $(this).data('connect');
        connect($('#' + data.origin), $('#' + data.target));
      });
    };
    /**
     * Comprobación por AJAX del token
     *
     * @param {Object} token
     * @param {Boolean} directInteraction
     * @property {Number} token.id Identificador dada por la BD
     * @property {Number} token.element Identificador nativo del token
     * @property {Number} token.targetId Identificador del objeto sobre el que ha sido arrastrado
     * @property {Boolean} token.checked Comprobador si el token ya ha sido seleccionado
     */
    tokens.check = function(token, directInteraction) {
      if (self.options.properties.delayed && directInteraction) {
        console.log('PASA POR AQUI');
        console.log(token);
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
        //socket.emit('event:click:token', {id: token.data.id, activity: activity.id, room: self.options.room});
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
            console.log(data);
            //var token_data = data.tokens;
            for (var key in data.tokens) {
              var token = data.tokens[key];

              if (data.tokens[key].type == 'sel') {
                var valid = new String();
                if (data.tokens[key].valid) {
                  valid = 'correct checked';
                } else {
                  valid = 'wrong checked';
                }
                $container.find('#' + data.tokens[key].id).addClass(valid);

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
              $.event.trigger('token:action', {token: token, directInteraction: directInteraction});
            }

            activity.valid = data.activity.valid;
            answer.setProperties(data.answer);
            if (data.activity.finished) {
              activity.setFinished(data);
              // disableElements();
            }
          }
        });
      };
    };

    function disableElements() {
      $container.find('.token-clickable').toggleClass('token-clickable');
      var disabled = $('.token-movable').draggable('option', 'disabled');
    }

    function pointObjectivesNotDone(objectives) {

      jsPlumb.restoreDefaults();
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
      /*** ESTO ESTA MODIFICADO CUIDADO **/
      var instance = jsPlumb.getInstance();
      instance.makeTarget($('#' + activity.id).find('.element'), {
        anchor: 'Continuous',
      });
      var e1 = instance.addEndpoint(id1, {
        //connectionType:"basic",
        anchor: 'Top',
        paintStyle: paintStyle,
        endpointStyle: paintStyle,
        isSource: true
      });
      var e2 = instance.addEndpoint(id2, {
        isTarget: true,
        anchor: 'Bottom',
        endpoint: 'Blank'
      });
      instance.connect({
        source: e1,//id1,
        target: e2,//id2,
        detachable: false,
        overlays: [
          ['Arrow' , {width: 25, length: 25, location: 0.99}]
        ],
        paintStyle: lineStyle//{strokeStyle: 'green', lineWidth: 7},
      });
    }

    /**
     *
     */
    // Jugador conectado
    socket.on(sockets.client.player.connected, function(data) {
      $('#' + data.player.user.id).fadeIn();
      $('[data-user="' + data.player.user.id + '"]').addClass('connected').removeClass('select-player');
    });

    socket.on(sockets.client.token.action, function(data) {
      // Número de interacciones por token
      if (self.options.player.id != data.player) {
        var targets = [];
        data.tokens.forEach(function(token) {
          var isCommon = $container.find('#' + token.id).parent().hasClass('common');
          var container = $container.find('#' + token.id).find('.interaction-num');
          var num = parseInt(container.text()) > 0 ? parseInt(container.text()) + 1 : 1;
          container.fadeIn().text(num);

          if (token.target) {
            var container_target = $container.find('#' + token.target.id).find('.interaction-num');
            container_target.fadeIn().html('&nbsp;&nbsp;');
            if (!targets[token.target.id]) {
              targets[token.target.id] = true;
              container_target.css('background-color', 'rgb(' + randomColor() + ')');
            } else {
              container.css('background-color', container_target.css('background-color'));
            }
          } else {
            // Se selecciona el color de su target
            //container.css('background-color', .css('background-color'))
          }

          if (self.options.properties.turns) {
            if (data.group == self.options.player.group.id) {
              if (isCommon) {
                tokens.check(token, false);
              }
            }
          } else {
            if (isCommon) {
              tokens.check(token, false);
            }
          }
        });
      }
    });

    socket.on(sockets.client.group.timeout, function(data) {
      self.options.player.group.finished = true;
    });

    socket.on(sockets.client.activity.finished, function(data) {
      if (data.group.id == self.options.player.group.id) {
        if (data.group.finished) {
          self.options.player.group.finished = true;
          self.player.setActive(true);
        } else {
          if (data.nextPlayer === self.options.player.id) {
            self.player.setActive(true, data.nextPlayer);
          } else {
            self.player.setActive(false, data.nextPlayer);
          }
        }
      }
    });

    this.player = {};
    this.player.setActive = function(isActive, player_id) {
      $container.find('#player-list li').removeClass('turn-on');
      if (isActive) {
        $container.find('.zone').removeClass('turn-off');
        $container.find('.hand-disabled').fadeOut();
      } else {
        $container.find('#' + self.options.player.id).removeClass('turn-on');
        $container.find('.zone').addClass('turn-off');
        $container.find('.hand-disabled').fadeIn();
      }
      if (player_id) {
        $container.find('#' + player_id).addClass('turn-on');
      }
    };

    // Eventos

    $document.on('token:action', function(event, data) {
      var socket_data = {
        tokens: [data.token],
        room: self.options.room,
        group: self.options.player.group ? self.options.player.group.id : undefined,
        player: self.options.player.id,
      };
      if ($container.find('#' + data.token.id).parent().hasClass('common') &&
        data.directInteraction) {
        socket_data.common = true;
      }
      socket.emit(sockets.server.token.action, socket_data);
    });

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
      }, true);
    });

    // Reinicio de una actividad
    $document.on('click', '#restart-activity', activity.restart);

    return this;
  };
}());
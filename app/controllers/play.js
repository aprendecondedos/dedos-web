var wrap = require('co-express');
var lib = require('../../lib/functions');
var gettext = require('../../i18n/i18n').gettext;
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
var Area = mongoose.model('Area');
var Token = mongoose.model('Token');
var Player = mongoose.model('Player');
var Answer = mongoose.model('Answer');

exports.load = wrap(function*(req, res, next, id) {
  const options = {
    criteria: {
      project: id
    }
  };
  req.project = yield Project.load(options);
  if (req.session.player) {
    var player_session = {};
    player_session = req.session.player.filter(function(player) {
      return player.project == req.project.id ? player : '';
    });
    player_session = player_session.pop();
    req.player = player_session;
  }
  if (!req.project) { return next(new Error('Not found')); }

  next();
});

/**
 * Inicio del juego
 */
exports.index = wrap(function*(req, res) {
  const project = req.project;
  var view = 'play/index';
  if (lib.isEmptyObject(req.player) || !req.player) {
    // @TODO
    //view = 'play/select_player';
  }
  var activity = project.activities[0];
  // @TODO
  // obtener la última actividad donde se tenga respuestas
  // o donde Answer tenga done = true

  //var activity = player.getPrevActivity(activity.id);
  //var activity = player.getNextActivity(activity.id);
  //var activity = player.getLastActivity(activity.id);
  const activity_data = {
    id: activity.id,
    num: project.getActivityNum(activity.id)
  };
  res.render(view, {
    title: gettext('play'),
    project: req.project,
    player: req.player,
    activity: activity_data
  });
});

/**
 * Funcionalidad sobre actividades
 *
 * @type {{load: *, show: *, check: *}}
 */
exports.activity = {
  load: wrap(function*(req, res, next, id) {
    var options = {
      criteria: {
        _id: id,
        project: req.project.id
      }
    };
    req.activity = yield Activity.load(options);

    var area_options = {
      criteria: {
        '_id': {$in: req.activity.elements},
        '__t': 'Area'
      }
    };
    req.activity.elements.area = yield Area.list(area_options);

    if (!req.activity) {return next(new Error('Not found')); }

    next();
  }),
  /**
   * Mostrar la actividad dado una id
   */
  show: wrap(function*(req, res) {
    const project = req.project;
    var activity = req.activity;
    // Socket emit
    //req.socket.emit('player:connected', { name: 'testing' });
    //status: {type: Number, default: 0}, // types: {0: Sin empezar, x: Numero de la actividad, -1: Terminado}
    //project.status = 3;
    //yield project.save();
    //yield Project.update({_id: req.project.id, 'players.user': req.body.player_id}, {$set: {'players.$.online': true}});
    //@TODO comprobar si el usuario ha completado o no el proyecto
    activity.num = project.getActivityNum(activity.id);
    project.setPlayerStatus(
      req.player.user.id,
      activity.num
    );
    project.save();
    // Target si los objetivos son de emparejamiento
    var targets = [];
    activity.objectives.forEach(function(objective) {
      if (objective.targets && objective.type == 'pair') {
        targets.push(objective.targets.join());
      }
    });
    res.render('play/show', {
      title: gettext('play'),
      project: project,
      activity: activity,
      targets: targets
    });
  }),
  /**
   * Comprobaciónes sobre información enviada
   * relacionada con el usuario y el/los token/s
   */
  check: wrap(function*(req, res) {
    const tokens = req.body.tokens;
    const activity = req.activity;
    var selection = false;
    var pair = false;
    var type = "tipo de objetivo";
    var targets = [];
    var tokens_result = [];
    var activity_result = true;
    activity.objectives.forEach(function(objective) {
      if (objective.obj) {
        targets.push(objective.obj);
        selection = true;
      } else if (objective.targets) {
        targets.push({origen: objective.origen, targets: objective.targets});
        pair = true;
      };
    });
    // @TODO insertar respuestas en el modelo Answer
    var answer = new Answer({
      player: req.player.user.id,
      activity: activity.id,
      answered: true
    });
    var answer_options = {
      criteria: {
        player: req.player.user.id,
        activity: activity._id
      }
    };
    var answer = yield Answer.load(answer_options);
    if (answer) {
     // stuff
    } else {
      //answer.save();
    }

    tokens.forEach(function(token) {
      var result = false;
      if (selection) {
        type = 'selection';
        console.log(targets);
        if (targets.indexOf(token.element_id) != -1) {
          result = true;
        }
      } else if (pair) {
        type = 'pair';
        targets.forEach(function(target) {
          if (token.element_id === target.origen) {
            if (target.targets.indexOf(token.targetName) != -1) {
              result = true;
              console.log('EMPAREJAMIENTO_CORRECTO');
            }
          }
        });
      };
      if (!result) {
        activity_result = false;
      }
      tokens_result.push({
        id: token.id,
        type: type,
        valid: result
      });
    });

    res.send({
      tokens: tokens_result,
      activity: {
        id: activity.id,
        valid: activity_result
      }
    });
  })
};

/**
 * Jugador
 */
exports.player = wrap(function*(req, res) {
  // Solo se ejecuta por ajax
  if (req.xhr && req.body) {
    switch (req.body.type){
      // Seleccion de jugador
      case 'select':
        //yield Project.update({_id: req.project.id, 'players.user': req.body.player_id}, {$set: {'players.$.online': true}});
        var player = yield Player.load(req.body.player_id);
        var player_data = {
          project: req.project.id,
          user: {
            id: req.body.player_id,
            name: player.name,
            avatar: req.body.avatar
          }
        };
        if (!req.session.player) { req.session.player = []; }

        req.session.player.push(player_data);
        break;
    }
    res.json(player_data);
    //res.sendStatus(200);
  }
});

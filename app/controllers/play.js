var wrap = require('co-express');
var lib = require('../../lib/functions');
var gettext = require('../../i18n/i18n').gettext;
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
var Area = mongoose.model('Area');
var Player = mongoose.model('Player');

exports.load = wrap(function*(req, res, next, id) {
  const options = {
    criteria: {
      project: id
    }
  };
  req.project = yield Project.load(options);

  if (!req.project) { return next(new Error('Not found')); }

  next();
});

exports.index = function(req, res) {
  var player_session = {};
  if (req.session.player) {
    player_session = req.session.player.filter(function(player) {
      return player.project == req.project.id ? player : '';
    });
    player_session = player_session.pop();
  }
  var view = 'play/index';
  if (lib.isEmptyObject(player_session)) {
    // @TODO
    //view = 'play/select_player';
  }
  res.render(view, {
    title: gettext('play'),
    project: req.project,
    player: player_session
  });
};

exports.new = function() {

};
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

  show: wrap(function*(req, res) {

    var areas = req.activity.elements.area;

    // Socket emit
    //req.socket.emit('player:connected', { name: 'testing' });

    res.render('play/show', {
      title: gettext('play'),
      project: req.project,
      activity: req.activity,
      areas: areas
    });
  })
};

exports.player = wrap(function*(req, res) {
  // Solo se ejecuta por ajax
  if (req.xhr && req.body) {
    switch (req.body.type){
      case 'select':
        //yield Project.update({_id: req.project.id, 'players.user': req.body.player_id}, {$set: {'players.$.online': true}});
        var player = yield Player.load(req.body.player_id);

        var player_data = {
          project: req.project.id,
          user: {
            id: player._id,
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

exports.admin = function() {

};

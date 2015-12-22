var wrap = require('co-express');
var gettext = require('../../i18n/i18n').gettext;
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
var Area = mongoose.model('Area');
var Player = mongoose.model('Player');

exports.load = wrap(function* (req, res, next, id){
  const options = {
    criteria: {
      project: id
    }
  };
  req.project = yield Project.load(options);
  if (!req.project) return next(new Error('Not found'));

  next();
});

exports.index = function(req, res){
  res.render('play/index', {
    title: gettext('play'),
    project: req.project
  });
};

exports.new = function(){

};
exports.activity = {
  load: wrap(function* (req, res, next, id){
    var options = {
      criteria: {
        _id: id,
        project: req.project.id
      }
    };

    req.activity = yield Activity.load(options);
    var area_options = {
      criteria:{
        '_id': { $in: req.activity.elements},
        '__t': 'Area'
      }
    };

    req.activity.elements.area = yield Area.list(area_options);

    if (!req.activity) return next(new Error('Not found'));

    next();
  }),

  index: wrap(function* (req, res){
    //console.log(req.activity);
    var options = {
      criteria:{
        //'_id': { $in: req.activity.elements},
        '__t': 'Area'
      }
    };
    //const area = yield Area.list(options);
    //console.log(req.activity.elements[1]);
    //console.log(req.activity.elements.area);
    var area = req.activity.elements.area;
    console.log(req.project);

    // Socket emit
    //req.socket.emit('player:connected', { name: 'testing' });

    res.render('play/index', {
      title: gettext('play'),
      project: req.project,
      activity: req.activity,
      areas: area
      //players: Array.apply(null, Array(50)).map(String.prototype.valueOf, "hi")
    });
  })
};

exports.player = function(req, res){
  // Solo se ejecuta por ajax
  if(req.xhr && req.body){
    switch (req.body.type){
      case 'select':
        req.session.player = req.body.player_id;
        break;
    }

    res.sendStatus(200);
  }
};

exports.admin = function(){

};

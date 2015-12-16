var mongoose = require('mongoose');
var Classroom = mongoose.model('Classroom');
var gettext = require('../../i18n/i18n').gettext;
var extend = require('util')._extend;
var wrap = require('co-express');

exports.load = function(req, res, next, id) {
    Classroom.load(id, function (err, classroom) {
        if (err) return next(err);
        if (!classroom) return next(new Error('Failed to load Classroom'));
        req.classroom = classroom;
        next();
    });
};

exports.index = function(req, res){

  var options = {
    criteria: {
      teachers: req.user._id
    }
  };
  Classroom.list(options, function(err, classrooms) {
    if (err) return res.render('500');
      var view = 'classroom/index';
      // Detectamos si viene de una petición AJAX
      if(req.xhr){
        view = 'classroom/ajax/index';
      }
      res.render(view, {
      title: gettext('classrooms:my'),
      classrooms: classrooms
    });
  });
};

exports.new = function(req, res){
  if(req.method == 'POST'){
    var classroom = new Classroom(req.body);
    // Se añade al profesor
    classroom.addTeachers(req.user);
    classroom.save();

    res.redirect('/classrooms');
  } else {
    res.render('classroom/new', {
      title: gettext('classroom:new'),
      classroom: new Classroom(),
      players: Array.apply(null, Array(50)).map(String.prototype.valueOf, "hi")
    });
  }
};

exports.edit = wrap(function* (req, res){
  var options = {
    criteria: {
      '_id': req.classroom._id
    }
  };
  var players = yield Classroom.list(options);

  res.render('classroom/form', {
    title: gettext('classroom:edit'),
    classroom: req.classroom,
    players: req.classroom.students
  });
});

exports.show = function(req, res){
  res.render('classroom/show', {
    title: gettext('classroom:show'),
    classroom: req.classroom,
  });
};

exports.update = function(req, res){
  delete req.body.user;
  var classroom = req.classroom;
  classroom = extend(classroom, req.body);
  classroom.save();

  res.redirect('/classrooms');
};

exports.destroy = function(req, res){
  var classroom = req.classroom;
  classroom.remove(function (err){
    req.flash('success', 'Deleted successfully');
    res.redirect('/classrooms');
  });
};
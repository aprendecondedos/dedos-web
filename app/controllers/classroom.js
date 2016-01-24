var mongoose = require('mongoose');
var Classroom = mongoose.model('Classroom');
var gettext = require('../../i18n/i18n').gettext;
var extend = require('util')._extend;
var wrap = require('co-express');
var edu = require('../../lib/education');

exports.load = wrap(function*(req, res, next, id) {
  req.classroom = yield Classroom.load(id);
  if (!req.classroom) { return next(new Error('Failed to load Classroom')); }
  next();
});

exports.index = wrap(function*(req, res) {
  const options = {
    criteria: {
      teachers: req.user._id
    }
  };
  const classrooms = yield Classroom.list(options);
  var view = 'classroom/index';
  // Detectamos si viene de una petición AJAX
  if (req.xhr) {
    view = 'classroom/ajax/index';
  }
  res.render(view, {
    title: gettext('classrooms:my'),
    classrooms: classrooms
  });
});

exports.new = function(req, res) {
  if (req.method == 'POST') {
    var classroom = new Classroom(req.body);
    var players = req.body.players;
    // Se añade al profesor
    classroom.addTeachers(req.user);
    // Tambien los estudiantes/jugadores
    if (players) {
      var users = [];
      for (player in players) {
        users.push(players[player]);
      }
      classroom.setPlayers(users);
    }

    classroom.save();

    res.redirect('/classrooms');
  } else {
    res.render('classroom/new', {
      title: gettext('classroom:new'),
      classroom: new Classroom(),
      education: {
        levels: edu.education_levels(),
        subjects: edu.subjects()
      }
    });
  }
};

exports.edit = wrap(function*(req, res) {
  res.render('classroom/form', {
    title: gettext('classroom:edit'),
    classroom: req.classroom,
    education: {
      levels: edu.education_levels(),
      subjects: edu.subjects()
    }
  });
});

exports.show = function(req, res) {
  res.render('classroom/show', {
    title: gettext('classroom:show'),
    classroom: req.classroom
  });
};

exports.update = function(req, res) {
  delete req.body.user;
  var classroom = req.classroom;
  var players = req.body.players;
  classroom = extend(classroom, req.body);
  if (players) {
    var users = [];
    for (player in players) {
      users.push(players[player]);
    }
    classroom.setPlayers(users);
  }

  classroom.save();

  res.redirect('/classrooms');
};

/**
 * Eliminar una clase
 */

exports.destroy = wrap(function*(req, res) {
  yield req.classroom.remove();
  req.flash('success', 'Deleted successfully');
  res.redirect('/classrooms');
});

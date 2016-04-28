var lib = require('../../lib/functions');
var wrap = require('co-express');
var mongoose = require('mongoose');
var Player = mongoose.model('Player');
var Classroom = mongoose.model('Classroom');
var XLSX = require('xlsx');

exports.load = function(req, res, next, id) {
  Player.load(id, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error('Failed to load User'));}
    req.user = user;
    next();
  });
};

exports.index = function(req, res) {

};

exports.new = wrap(function*(req, res) {
  if (req.method == 'POST') {
    var players_name = req.body.players_name;
    var avatars = req.body.files;
    var players = [];

    players_name.forEach(function(player_name, index) {
      players.push({name: player_name, avatar: (avatars[index].length ? avatars[index] : '')});
      console.log(req.body);
    });
    console.log(players);
    const users = yield Player.create(players);
    if (req.xhr) {
      res.json(users);
    }
  } else {
    res.render('user/signup', {
      user: new Player()
    });
  }
});

exports.import = function(req, res) {
  if (req.file) {
    var upload = lib.upload('file_upload');
    var players = [];
    // Subida de archivos para creación del proyecto
    upload(req, res, function(err) {
      var workbook = XLSX.readFile(req.file.path);
      var result = {};

      workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
        if (roa.length > 0) {
          result[sheetName] = roa;
        }
      });
      res.render('player/admin/excel_list', {
        sheets: result
      });
    });
  }
};

exports.edit = function(req, res) {
  Player.load({criteria: {_id: req.user._id}, select: 'email name'}, function(err, user) {
    res.render('user/edit', {
      user: user
    });
  });
};

exports.signin = function() {};
/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function(req, res) {
  res.render('user/login');
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Session
 */

exports.session = login;

/**
 * Login
 */

function login(req, res) {
  const redirectTo = req.session.returnTo ?
    req.session.returnTo
    : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}
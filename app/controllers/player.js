var lib = require('../../lib/functions');
var mongoose = require('mongoose');
var Player = mongoose.model('Player');
var Classroom = mongoose.model('Classroom');

exports.load = function(req, res, next, id) {
    Player.load(id, function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User'));
        req.user = user;
        next();
    });
};

exports.index = function(req, res){

};

exports.new = function(req, res){
    if(req.method == 'POST') {
      var players = req.body.player;
      var classroom_id = req.body.classroom;
      var users = [];
      players.name.forEach(function(player_name){
        var user = new Player({name: player_name});
        user.save(function (err) {
          if (err) {
            return res.render('user/signup', {
              errors: lib.errors(err.errors || err.message),
              user: user
            });
          }
          users.push(user);
        });
      });

      // Si se está añadiendo en una clase
      if(classroom_id){
        Classroom.load(classroom_id, function(err_cr, classroom){
          classroom.addStudents(users);
          classroom.save();
        });
        return res.redirect(req.header('Referer'));
      }

      return res.redirect('');
    } else {
        res.render('user/signup', {
            user: new Player()
        });
    }
};

exports.edit = function (req, res) {

  Player.load({ criteria: { _id: req.user._id }, select: 'email name' }, function (err, user) {
    res.render('user/edit', {
      user: user
    });
  });

};

exports.signin = function () {};
/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
    res.render('user/login');
};

exports.logout = function(req, res){
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

function login (req, res) {
    const redirectTo = req.session.returnTo
        ? req.session.returnTo
        : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
}
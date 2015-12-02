var lib = require('../../lib/functions');
var mongoose = require('mongoose');
var Teacher = mongoose.model('Teacher');


exports.load = function(req, res, next, id) {
    Teacher.load(id, function (err, user) {
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
        var user = new Teacher(req.body);
        user.provider = 'local';
        user.save(function (err) {
            if (err) {
                return res.render('user/signup', {
                    errors: lib.errors(err.errors || err.message),
                    user: user
                });
            }
            // Emviamos un correo de bienvenida
            var mailer = require('../mailer');
            mailer.user.register(user);

            // manually login the user once successfully signed up
            req.logIn(user, function (err) {
                if (err) req.flash('info', 'Sorry! We are not able to log you in!');
                return res.redirect('/');
            });
        });
    } else {
        res.render('user/signup', {
            user: new Teacher()
        });
    }
};

exports.edit = function (req, res) {

  Teacher.load({ criteria: { _id: req.user._id }, select: 'email name' }, function (err, user) {
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
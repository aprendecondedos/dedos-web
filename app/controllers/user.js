var lib = require('../../lib/functions');
var mongoose = require('mongoose');
var Teacher = mongoose.model('Teacher');


exports.load = function(req, res, next, id) {
    User.load(id, function (err, user) {
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
                console.log(err);
                return res.render('user/signup', {
                    errors: lib.errors(err.errors || err.message),
                    user: user,
                    title: 'Sign up'
                });
            }

            // manually login the user once successfully signed up
            req.logIn(user, function (err) {
                console.log(err);
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

exports.signin = function () {};
/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
    res.render('user/login', {
        title: 'Login'
    });
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
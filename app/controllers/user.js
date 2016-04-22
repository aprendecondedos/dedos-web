var lib = require('../../lib/functions');
var mongoose = require('mongoose');
var fs = require('fs');
var gm = require('gm');
var User = mongoose.model('User');
var Teacher = mongoose.model('Teacher');

exports.load = function(req, res, next, id) {
  Teacher.load(id, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error('Failed to load User')); }
    req.user = user;
    next();
  });
};

exports.index = function(req, res) {

};

exports.new = function(req, res) {
  if (req.method == 'POST') {
    var user = new Teacher(req.body);
    user.provider = 'local';
    user.save(function(err) {
      if (err) {
        return res.render('user/signup', {
          errors: lib.errors(err.errors || err.message),
          user: user
        });
      }
      // Enviamos un correo de bienvenida
      var mailer = require('../mailer');
      mailer.user.register(user);
      // manually login the user once successfully signed up
      req.logIn(user, function(err) {
        if (err) { req.flash('info', 'Sorry! We are not able to log you in!'); }
        return res.redirect('/');
      });
    });
  } else {
    res.render('user/signup', {
      user: new Teacher()
    });
  }
};

exports.edit = function(req, res) {
  Teacher.load({criteria: {_id: req.user._id}, select: 'email name'}, function(err, user) {
    res.render('user/edit', {
      user: user
    });
  });
};

exports.uploadImage = function(req, res) {
  const file = req.file;
  const user_id = req.body.id;

  var extension = file.mimetype.split('/');
  var new_filename = (user_id ? user_id : mongoose.Types.ObjectId()) + '.' + extension[1];
  var new_path = 'users/pics/';
  var source = fs.createReadStream(file.destination + file.filename);
  var new_file = new_path + new_filename;
  var dest = fs.createWriteStream(file.destination + new_file);

  gm(file.destination + new_file)
    .resize(240, 240)
    .noProfile()
    .write(file.destination + new_file, function(err) {
      if (!err) { console.log('done'); }
    });

  source.pipe(dest);
  source.on('end', function() {
    // Si se encuentra el usuario se actualiza los datos
    if (user_id) {
      User.load(user_id, function(err, user) {
        user.avatar = new_file;
        user.save();
      });
    }
    fs.unlink(file.destination + file.filename);
    res.jsonp({
      img: {
        path: new_path,
        filename: new_filename
      }
    });
  });
  source.on('error', function(err) {
    res.status(500).send('Problemas con la imagen');
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

function login(req, res) {
  //if (req.body.remember) {
  //  req.session.cookie.maxAge = 1000 * 60 * 3;
  //} else {
  //  req.session.cookie.expires = false;
  //}

  const redirectTo = req.session.returnTo
      ? req.session.returnTo
      : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}
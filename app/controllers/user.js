var lib = require('../../lib/functions');
var mongoose = require('mongoose');
var extend = require('util')._extend;
var wrap = require('co-express');
var fs = require('fs');
var gm = require('gm');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
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

exports.forgot = function(req,res, next){
  if(req.method == "GET") {
      res.render('user/forgot');
  }else{
          async.waterfall([
              function(done) {
                  crypto.randomBytes(20, function(err, buf) {
                      var token = buf.toString('hex');
                      done(err, token);
                  });
              },
              function(token, done) {
                  Teacher.load({ email: req.body.email }, function(err, user) {
                      if (!user) {
                          req.flash('error', 'No account with that email address exists.');
                          return res.redirect('/forgot');
                      }

                      user.resetPasswordToken = token;
                      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                      user.save(function(err) {
                          done(err, token, user);
                      });
                  });
              },
              function(token, user, done) {
              console.log(req.headers);
                  var smtpTransport = nodemailer.createTransport('SMTP', {
                      service: 'Gmail',
                      auth: {
                          user: 'aprendecondedospwd@gmail.com',
                          pass: 'aprendecondedospwd1!'
                      }
                  });
                  var mailOptions = {
                      to: req.body.email,
                      from: 'passwordreset@aprendecondedos.es',
                      subject: 'Password Reset player.aprendecondedos.es',
                      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                  };
                  console.log("2");
                  smtpTransport.sendMail(mailOptions, function(err) {
                      req.flash('info', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
                      done(err, 'done');
                  });
              }
          ], function(err) {
              if (err) return next(err);
              res.redirect('/forgot');
          });

  };
};

exports.reset = function(req, res) {
    if(req.method == "POST") {
        console.log("1");
        async.waterfall([
            function (done) {
                Teacher.load({
                    resetPasswordToken: req.params.token,
                    resetPasswordExpires: {$gt: Date.now()}
                }, function (err, user) {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }
                    console.log("user: " + user);

                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function (err) {
                        req.logIn(user, function (err) {
                            done(err, user);
                        });
                    });
                });
            },
            function (user, done) {
                console.log("32");
                console.log(user);
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'Gmail',
                    auth: {
                        user: 'aprendecondedospwd@gmail.com',
                        pass: 'aprendecondedospwd1!'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'passwordreset@aprendecondedos.es',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash('success', 'Success! Your password has been changed.');
                    done(err);
                });
            }
        ], function (err) {
            res.redirect('/');
        });
    } else {
        Teacher.load({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/forgot');
            }
            console.log(req.params.token);
            res.render('user/reset', {
                token: req.params.token
            });
        });
    }
};

exports.new = function(req, res) {
  if (req.method == 'POST') {
    console.log(req.body);
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
      user: user,
      title: user.name
    });
  });
};

exports.editAccount = function(req, res) {
  Teacher.load({criteria: {_id: req.user._id}, select: 'email name'}, function(err, user) {
    user = extend(user, req.body);
    user.save();
    res.redirect('/user/settings');
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
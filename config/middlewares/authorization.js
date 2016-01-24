'use strict';
var lib = require('../../lib/functions');

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  if (req.method == 'GET') { req.session.returnTo = req.originalUrl; }
  res.redirect('/login');
};

exports.requiresPlayerLogin = function(req, res, next) {
  var player_session = {};
  if (req.session.player) {
    player_session = req.session.player.filter(function(player) {
      return player.project == req.project.id ? player : '';
    });
    player_session = player_session.pop();
  }
  if (!req.session.player || lib.isEmptyObject(player_session)) {
    req.flash('info', 'You are not authorized');
    return res.redirect('/');
  }
  next();
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function(req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/users/' + req.profile.id);
    }
    next();
  }
};

/*
 *  Autorización de la Clase routing middleware
 */
exports.classroom = {
  hasAuthorization: function(req, res, next) {
    if (req.classroom.teachers.indexOf(req.user._id) == -1) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/classrooms');
    }

    next();
  }
};

/*
 *  Autorización del Proyecto routing middleware
 */
exports.project = {
  hasAuthorization: function(req, res, next) {
    if (req.project.createdBy == req.user._id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/projects');
    }

    next();
  }
};

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function(req, res, next) {
    // if the current user is comment owner or article owner
    // give them authority to delete
    if (req.user.id === req.comment.user.id || req.user.id === req.article.user.id) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      res.redirect('/articles/' + req.article.id);
    }
  }
};

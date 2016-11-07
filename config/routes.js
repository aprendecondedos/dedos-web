var lib = require('../lib/functions');
var classroom = require('../app/controllers/classroom');
var project = require('../app/controllers/project');
var play = require('../app/controllers/play');
var user = require('../app/controllers/user');
var player = require('../app/controllers/player');
var auth = require('../config/middlewares/authorization');
var url = require('url');

/**
 * Route middlewares
 */
var classroomAuth = [auth.requiresLogin, auth.classroom.hasAuthorization];
var projectAuth = [auth.requiresLogin, auth.project.hasAuthorization];

module.exports = function(app, passport, io) {

  app.get('/', auth.requiresLogin, project.new);

  // User routes
  app.get('/signup', user.new);
  app.post('/signup', user.new);
  app.get('/login', user.login);
  app.post('/login',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), user.session);
  app.get('/logout', user.logout);
  // social login
  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: ['email', 'user_about_me'],
      failureRedirect: '/login'
    }), user.signin);
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), user.authCallback);
  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), user.signin);
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), user.authCallback);

  app.param('userId', user.load);

  app.get('/user/settings', auth.requiresLogin, user.edit);
  app.put('/user/settings/account', auth.requiresLogin, user.editAccount);
  app.post('/user/upload/image', auth.requiresLogin, user.uploadImage);

  // Classroom routes
  app.param('classroomId', classroom.load);

  app.get('/classrooms', auth.requiresLogin, classroom.index);
  app.get('/classroom/new', auth.requiresLogin, classroom.new);
  app.post('/classroom/new', auth.requiresLogin, classroom.new);
  app.get('/classroom/:classroomId/edit', classroomAuth, classroom.edit);

  app.route('/classroom/:classroomId').all(classroomAuth)
    .get(classroom.show)
    .put(classroom.update)
    .delete(classroom.destroy);

  // Player routes
  app.get('/player/new', auth.requiresLogin, player.new);
  app.post('/player/new', auth.requiresLogin, player.new);
  app.post('/player/import', auth.requiresLogin, player.import);

  // Project routes
  app.param('projectId', project.load);

  app.get('/projects/my', auth.requiresLogin, project.my);
  app.get('/projects', auth.requiresLogin, project.index);
  app.get('/project/new', auth.requiresLogin, project.new);
  app.post('/project/new', auth.requiresLogin, project.new);
  app.get('/project/:projectId/settings', projectAuth, project.settings);
  app.get('/project/:projectId/statistics', projectAuth, project.statistics);
  app.get('/project/:projectId/export', projectAuth, project.export);
  app.get('/project/:projectId/copy', projectAuth, project.copy);

  app.route('/project/:projectId').all(projectAuth)
    .get(project.show)
    .put(project.update)
    .delete(project.destroy);

  // Other routes
  app.get('/faq', auth.requiresLogin, function(req, res) {
    console.log('test');
  });

  // Play routes

  app.param('playId', play.load);
  app.param('activityId', play.activity.load);
  app.param('answerId', play.answer.load);

  app.get('/play', play.select);
  app.post('/play/:playId',[], play.index);
  app.get('/play/:playId',[], function(req, res, next) {
    play.index(req, res);
  });
  app.post('/play/:playId/player', play.player);
  app.get('/play/:playId/activity/:activityId', auth.requiresPlayerLogin, play.activity.show);
  app.post('/play/:playId/activity/:activityId/check', auth.requiresPlayerLogin, play.activity.check);

  app.route('/play/:playId/answer/:answerId').all(auth.requiresPlayerLogin)
    .delete(play.answer.destroy);

  //app.get( "/strings/:lang?", i18n.stringsRoute( "en-US" ) );

  //// Play routes
  //app.get('/play/:id', play.show);
  //app.get('/play/:id/admin', play.admin);

};

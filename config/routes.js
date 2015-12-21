var lib = require('../lib/functions');
var classroom = require('../app/controllers/classroom');
var project = require('../app/controllers/project');
var play = require('../app/controllers/play');
var user = require('../app/controllers/user');
var player = require('../app/controllers/player');
var auth = require('../config/middlewares/authorization');

/**
 * Route middlewares
 */
var classroomAuth = [auth.requiresLogin, auth.classroom.hasAuthorization];

module.exports = function (app, passport, io) {
    //var project = require('../app/controllers/project')(io);

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
            scope: [ 'email', 'user_about_me'],
            failureRedirect: '/login'
        }), user.signin);
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/login'
        }), user.authCallback);
    app.get('/auth/github',
        passport.authenticate('github', {
            failureRedirect: '/login'
        }), user.signin);
    app.get('/auth/github/callback',
        passport.authenticate('github', {
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
    app.get('/auth/google',
        passport.authenticate('google', {
            failureRedirect: '/login',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ]
        }), user.signin);
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/login'
        }), user.authCallback);
    app.get('/auth/linkedin',
        passport.authenticate('linkedin', {
            failureRedirect: '/login',
            scope: [
                'r_emailaddress'
            ]
        }), user.signin);
    app.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', {
            failureRedirect: '/login'
        }), user.authCallback);

    app.param('userId', user.load);
  //{% include pets.html with pets only %}
    app.get('/user/settings',auth.requiresLogin, user.edit);
    app.post('/user/settings',auth.requiresLogin, user.edit);

    // Classroom routes
    app.param('classroomId', classroom.load);

    app.get('/classrooms', auth.requiresLogin, classroom.index);
    app.get('/classroom/new', auth.requiresLogin, classroom.new);
    app.post('/classroom/new', auth.requiresLogin, classroom.new);
    app.get('/classroom/:classroomId', classroomAuth, classroom.show);
    app.get('/classroom/:classroomId/edit', classroomAuth, classroom.edit);
    app.put('/classroom/:classroomId', classroomAuth, classroom.update);
    app.delete('/classroom/:classroomId', classroomAuth, classroom.destroy);

    // Player routes
    app.get('/player/new', auth.requiresLogin, player.new);
    app.post('/player/new', auth.requiresLogin, player.new);

    // Project routes
    app.param('projectId', project.load);

    app.get('/projects/my',auth.requiresLogin, project.my);
    app.get('/projects',auth.requiresLogin, project.index);
    app.get('/project/new',auth.requiresLogin, project.new);
    app.post('/project/new', auth.requiresLogin, project.new);
    app.get('/project/:projectId', auth.requiresLogin, project.show);
    app.get('/project/:projectId/admin', auth.requiresLogin, project.admin);
    //app.get('/project/:id/admin', lib.upload([{name: 'file_zip'}]), lib.test(), project.admin);

    // Other routes
    app.get('/faq',auth.requiresLogin, function(req, res){
      console.log('test');
    });

    // Play routes
    app.param('playId', play.load);
    app.param('activityId', play.activity.load);

    app.get('/play/:playId',[], play.index);
    app.post('/play/:playId/player', play.player);
    app.get('/play/:playId/activity/:activityId',[], play.activity.index);

    //// Play routes
    //app.get('/play/:id', play.show);
    //app.get('/play/:id/admin', play.admin);

};
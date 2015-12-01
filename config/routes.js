var classroom = require('../app/controllers/classroom');
var project = require('../app/controllers/project');
var play = require('../app/controllers/play');
var user = require('../app/controllers/user');

/**
 * Route middlewares
 */
var auth = require('../config/middlewares/authorization');

module.exports = function (app, passport) {

    app.get('/', auth.requiresLogin, project.new);

    // User routes
    app.param('userId', user.load);
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

    // Project routes
    app.param('classroomId', classroom.load);
    app.get('/classrooms',auth.requiresLogin, classroom.list);
    app.get('/classroom/new',auth.requiresLogin, classroom.new);
    app.post('/classroom/new',auth.requiresLogin, classroom.new);

    // Project routes
    app.param('projectId', project.load);
    app.get('/projects',auth.requiresLogin, project.list);
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
    app.get('/play/:id', play.show);
    app.get('/play/:id/admin', play.admin);

};
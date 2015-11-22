var lib = require('../lib/functions');
var multer = require('multer');

module.exports = function (app, passport) {
    var classroom = require('classroom');
    var project = require('project');
    var play = require('play');
    var user = require('user');

    app.get('/', project.index);

    //app.get('/articles/new', auth.requiresLogin, articles.new);
    //app.get('/create/class', classroom.create);

    // Project routes
    app.param('projectId', project.load);
    app.get('/project/new', project.new);
    app.post('/project/new', project.new);
    app.get('/project/:projectId', project.show);
    app.get('/project/:projectId/admin', project.admin);
    //app.get('/project/:id/admin', lib.upload([{name: 'file_zip'}]), lib.test(), project.admin);

    // Play routes
    app.get('/play/:id', play.show);
    app.get('/play/:id/admin', play.admin);

// assume 404 since no middleware responded
    app.use(function (req, res) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });
};
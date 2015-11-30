var express = require('express');
var io = require('socket.io');
var passport = require('passport');
var path = require('path');
var favicon = require('serve-favicon');
//var nunjucks = require('nunjucks');
var swig = require('swig');
var logger = require('morgan');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var helpers = require('view-helpers');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var mongoose =  require('mongoose');
var fs = require('fs');
var join = require('path').join;
var config = require('./config/config');
var pkg = require('./package.json');

var app = express();


// MongoDB config
var configDB = require('./config/database.js');
// Connecto to MongoDB
mongoose.connect(configDB.url);

var i18n = require('./i18n/i18n');
app.use(i18n.middleware({
    supported_languages: ['es', 'en'],
    default_lang: "es",
    mappings: {
        'es': 'es'
    },
    translation_directory: __dirname+"/i18n"
}));

// view engine setup
//nunjucks.configure('app/views', {
//  autoescape: true,
//  express: app,
//  watch: true
//});
app.engine('html', swig.renderFile);

app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'html');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('secret'));

app.use(session({
    resave: true,
    cookie: { maxAge: 60000 },
    secret: pkg.name,
    saveUninitialized: true,
    store: new mongoStore({
        url: config.db,
        collection : 'sessions'
    })
}));
app.use(flash());

// use passport session
app.use(passport.initialize());
app.use(passport.session());

app.use(helpers(pkg.name));

// Bootstrap models

fs.readdirSync(join(__dirname, 'app/models')).forEach(function (file) {
    if (~file.indexOf('.js')) require(join(__dirname, 'app/models', file));
});
// Bootstrap routes
require('./app/routes')(app, passport);

require('./config/passport')(passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

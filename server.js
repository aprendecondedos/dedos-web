/**
 * Module dependencies
 */

var fs = require('fs');
var join = require('path').join;
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/config');
var flash = require('connect-flash');

var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;
app.use(flash());

// Connect to mongodb
var connect = function() {
  var options = {server: {socketOptions: {keepAlive: 1}}};
  mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(join(__dirname, 'app/models')).forEach(function(file) {
  if (~file.indexOf('.js')) { require(join(__dirname, 'app/models', file)); }
});

// Bootstrap passport config
require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, passport);

var io = require('socket.io')(server);

// Socket routes
require('./config/socket')(io, app);

// Bootstrap routes
require('./config/routes')(app, passport, io);

// Errors handlers
require('./config/errors')(app);

server.listen(port);
console.log('Express app started on port ' + port);


/**
 * Expose
 */

module.exports = app;

'use strict';

var project = require('../app/sockets/project');

module.exports = function(io, app) {
  app.set('socket.io', io);
  //io.set('authorization', function(data, accept) {
  //
  //});

  io.on('connection', function(socket) {
    console.log('Connected ' + socket.id);

    // Project sockets
    socket.on('project:join', project.join_room);
    socket.on('server project:player:connected', project.player.connected);
    socket.on('server project:player:disconnected', project.player.disconnected);
    //console.log(io.sockets.adapter.rooms);

    var cookie = socket.request.headers.cookie;

    socket.on('event:click:token', function(data) {
      // Envia los datos a todos incluido el socket del emisor
      io.sockets.emit('event:token', data);
      // TODO añadirlo en una sala (room) por proyecto
      //socket.in('CLASSID').emit('event:click:tokens', data);
    });
    socket.on('disconnect', function() {
      console.log('Disconnected ' + socket.id);
      if (socket.player) {
        console.log(socket.player);
        project.player.disconnected({room: socket.player.project, player: socket.player}, socket);
      }
    });
  });
  //io.use(function (socket, next) {
  //  app.use(function (req, res, next) {
  //  req.socket_d = socket;
  //  next();
  //});
  //});
};
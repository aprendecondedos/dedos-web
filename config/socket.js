var project = require('../app/sockets/project');

module.exports = function (io, app) {
  app.set('socket.io', io);
  //io.set('authorization', function(data, accept) {
  //
  //});

  io.on("connection", function (socket) {
    console.log('Connected '+socket.id);
    //console.log('Inicio');
    //console.log(io);
    //console.log("----------")
    //console.log(socket);
    // Project sockets
    socket.on('project:join', project.join);
    socket.on('project:player:disconnected', project.player.disconnected);
    socket.on('server project:player:connected', project.player.connected);
//console.log(io.sockets.adapter.rooms);

    var cookie = socket.request.headers.cookie;


    socket.on('event:click:token', function (data) {
      // Envia los datos a todos incluido el socket del emisor
      io.sockets.emit('event:token', data);
      // TODO añadirlo en una sala (room) por proyecto
      //socket.in('CLASSID').emit('event:click:tokens', data);
    });
    //socket.join('5672d3afe96e72e8437ee5c9');
    socket.on('player:connected', function (data) {
      io.sockets.to(data.room).emit('player:connectedx', data);
      console.log(data);
    });

  });
  //io.use(function (socket, next) {
  //  app.use(function (req, res, next) {
  //  req.socket_d = socket;
  //  next();
  //});
  //});
};
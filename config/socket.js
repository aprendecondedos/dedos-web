module.exports = function (server, app, passport) {
  var io = require("socket.io")(server);

  io.on("connection", function(socket){
    console.log('a user connected');
    socket.on('event:click:token', function (data) {
      // Envia los datos a todos incluido el socket del emisor
      io.sockets.emit('event:token', data);
      // TODO añadirlo en una sala (room) por proyecto
      //socket.in('CLASSID').emit('event:click:tokens', data);
    });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });
};
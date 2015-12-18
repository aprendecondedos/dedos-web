module.exports = function (io) {

  io.on("connection", function(socket){
    console.log('a user connected');
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
};
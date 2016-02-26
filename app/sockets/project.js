'use strict';

var wrap = require('co-express');
var extend = require('util')._extend;
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Answer = mongoose.model('Answer');
var User = mongoose.model('Player');

exports.join_room = function(room) {
  console.log('Sala: ' + room);
  this.join(room);
};
exports.leave_room = function(room) {
  this.leave(room);
};

exports.player = {
  connected: function(data) {
    //this.broadcast.emit('client:project:player:connected', data);
    //this.server.broadcast.to(data.room).emit('client:project:player:connected', data);
    //this.broadcast.emit('client:project:player:connected', data);
    //var user = yield User.load(data.id);
    this.join(data.room);
    this.player = data.player;
    this.id = data.room + '-' + data.id;
    var io = this.server;
    //yield Project.update({_id: data.room, 'players.user': data.player.user.id}, {$set: {'players.$.online': true}});
    if (data.player) {
      Project.update(
        {_id: data.room, 'players.user': data.player.user.id},
        {$set: {'players.$.online': true}}, function() {
        console.log('Guardado');
        data.status = 'online';
        //io.sockets.emit('client project:player:connected', data);
        io.sockets.in(data.room).emit('client project:player:connected', data);
      });
    }
  },
  disconnected: function(data, socket) {
    if (data.player) {
      var self = socket || this;
      var io = self.server;

      Project.update(
        {_id: data.room, 'players.user': data.player.user.id},
        {$set: {'players.$.online': false}}, function() {
          console.log('is OUT');
          io.sockets.in(data.room)
            .emit('client project:player:disconnected', data);
          self.leave(data.room);
        });
      //yield Project.update(
      //  {_id: data.room, 'players.user': data.player.user.id},
      //  {$set: {'players.$.online': false}}
      //);

    }
  }
};

exports.activity = {
  join: function(data) {
    data.player = {user: data.player};
    this.server.sockets.in(data.room).emit('client project:activity:join', data);
  },
  check: function(data) {
    var self = this;
    var value = 1;
    console.log('LLEGA AQUI ' + data.activity);
    var answer_options = {
      'activityData.activity': data.activity
    };
    Answer.list({
      criteria: answer_options
    }, function(err, obj) {
     // console.log(Answer);
      var answer = obj;
      if (answer) {
     //   value = answer.countToken(data.id,'sel');
      }
     // self.server.sockets.in(data.room).emit('event:count:token', {id: data.id, value: value});
    });
  }
};

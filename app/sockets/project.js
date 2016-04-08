'use strict';

var wrap = require('co-express');
var _ = require('underscore');
var extend = require('util')._extend;
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
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
    }
  }
};

exports.activity = {
  join: function(data) {
    data.player = {user: data.player};
    this.server.sockets.in(data.room).emit('client project:activity:join', data);
  },
  action: function(data) {
    this.server.sockets.in(data.room).emit('client token:action', data);
  },
  check: function(data) {
    var self = this;
    var value = 1;
    var answer_options = {
      criteria: {'activityData.activity': data.activity}
    };
    Answer.list(answer_options, function(err, obj) {
      // console.log(Answer);
      var answer = obj;
      if (answer) {
        //   value = answer.countToken(data.id,'sel');
      }
      // self.server.sockets.in(data.room).emit('event:count:token', {id: data.id, value: value});
    });
  },
  groupTimeOut: function(data) {
    var self = this;
    var activity_options = {
      criteria: {
        _id: data.activity
      }
    };
    Activity.load(activity_options, function(err, activity) {
      var group = activity.getGroupById(data.player.group.id);
      group.finished = true;
      activity.save();
      self.server.sockets.in(data.room).emit('client group:timeOut');
    });
  },
  finished: function(data) {
    var self = this;
    var activity_options = {
      criteria: {
        _id: data.activity
      }
    };
    Activity.load(activity_options, function(err, activity) {
      activity.setPropertiesFromPlayerGroup(data.player.group.id, data.player.id, {
        finished: true,
        active: false
      });
      var group = activity.getGroupById(data.player.group.id);
      if (group) {
        //group.timeOut = Date.now;
        var players_not_finished = _.where(group.players, {finished: false});
        var next_player = {};
        var new_data = {};
        if (players_not_finished.length > 0) {
          next_player = players_not_finished[0];
          activity.setPropertiesFromPlayerGroup(data.player.group.id, next_player.user._id, {active: true});
          new_data = {
            nextPlayer: next_player.user._id,
            group: {
              id: data.player.group.id,
              finished: false
            }
          };
        } else {
          if (group.players.length == data.numPlayers) {
            group.finished = true;
            new_data = {
              nextPlayer: undefined,
              group: {
                id: data.player.group.id,
                finished: true
              }
            };
          } else {
            var date = new Date();
            var players_finished = _.where(group.players, {finished: true});
            if (players_finished.length == 0) {
              group.timeOut = new Date();
            }

            if ((date - group.timeOut) >= 10000) {
              //if ((date - group.timeout) > 7200000 ) {
              group.finished = true;
            }
            new_data = {
              nextPlayer: undefined,
              group: {
                id: data.player.group.id,
                finished: group.finished,
              }
            };
          }
        }
      }
      /*
        new_data.group.timeOut = Date.now;
      */
      activity.save();
      self.server.sockets.in(data.room).emit('client project:activity:finished', new_data);
    });
  }
};

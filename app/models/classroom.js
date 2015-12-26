var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassroomSchema = new Schema({
  name            : String,
  education_level : String,
  players     : [{
    avatar: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'}
  }],
  teachers        : [{type: Schema.Types.ObjectId, ref: 'Teacher'}],
  createdDate    : {type: Date, default: Date.now},
  updatedDate    : {type: Date, default: Date.now}
});
var educationLevels = [
  'infant',
  'primary'
];
/**
 * Hooks
 */
ClassroomSchema.pre('save', function (next) {
  this.updatedDate = Date.now();

  next();
});

/**
 * Methods
 *
 * @type {{}}
 */
ClassroomSchema.methods = {

  getProjects: function(){

  },
  addTeachers: function(teachers){
    if(util.isArray(teachers)){
      this.teachers.concat(teachers);
    } else {
      this.teachers.push(teachers);
    }
  },
  addPlayer: function(user){
    this.players.push({
      avatar: user.avatar,
      user: user.id
    });
    return this;
  },
  setPlayers: function(users){
    var self = this;
    this.players = [];
    users.forEach(function(user){
      self.addPlayer(user);
    });
    return this;
  },
  addStudents: function(players){
    if(util.isArray(players)){
      this.students = this.students.concat(players);
    } else {
      this.students.push(players);
    }
  },
  setStudents: function(players){
    this.students = players;
  },
  getEducationLevels: function(){
     return educationLevels;
  }
};

/**
 * Statics
 */

ClassroomSchema.statics = {

    /**
     * Buscar clase por id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({_id: id})
          //.populate('teachers', 'name')
          .populate({path: 'players.user', select: 'name', options: {sort: { _id: -1 } }}) // Order by name DESC
          .exec(cb);
    },
    list: function (options, cb) {
      var criteria = options.criteria || {};
      var page = options.page || 0;
      var limit = options.limit || 30;

      return this.find(criteria)
        .populate('teachers', 'name')
        .populate('players.user', 'name')
        .sort({ createdDate: -1 })
        .limit(limit)
        .skip(limit * page)
        .exec(cb);
    }
}

mongoose.model('Classroom', ClassroomSchema);

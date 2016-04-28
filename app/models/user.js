var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
//var Student = require('../models/student');

// User model
var userSchemaSSSS = mongoose.Schema({
  createdDate: {type: Date, default: Date.now},
  name: String,
  picture: String,
  type: String,
  // Student properties
  projects: [{type: Schema.Types.ObjectId, ref: 'Project'}],
  createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
  // Teacher properties
  email: {type: String, unique: true, lowercase: true},
  password: String,
  classes: [{type: Schema.Types.ObjectId, ref: 'Class'}]
});

var UserSchema = Schema({
  createdDate: {type: Date, default: Date.now},
  name: String,
  avatar: String,
  type: String
});
//function baseSchema(){
var baseSchema = function() {
  Schema.apply(this, arguments);
  this.add({
    createdDate: {type: Date, default: Date.now},
    name: String,
    avatar: String,
    type: String
  });
};
util.inherits(baseSchema, Schema);
var userSchema = new baseSchema();

userSchema.methods.setAsTeacher = function() {
  this.type = 'teacher';
  return this;
};
userSchema.methods.setAsStudent = function() {
  this.type = 'student';
  return this;
};
/**
 * Methods
 *
 * @type {{}}
 */
UserSchema.methods = {
  getProjects: function() {

  }
};
/**
 * Statics
 */

UserSchema.statics = {

  /**
   * Buscar usuario por id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   */
  load: function(id, cb) {
    this.findOne({_id: id})
        .exec(cb);
  }
};
//module.exports = mongoose.model('User', userSchema);
//var User = mongoose.model('User', userSchema);
//module.exports = mongoose.model('User', userSchema);
mongoose.model('User', UserSchema);

//var studentSchema = new baseSchema({
//    projects       : [{type: Schema.Types.ObjectId, ref: 'Project'}],
//    createdBy      : {type: Schema.Types.ObjectId, ref: 'User'}
//});
//
//var Student = User.discriminator('Student', studentSchema);
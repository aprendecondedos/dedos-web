var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassroomSchema = new Schema({
  name            : String,
  students        : [{type: Schema.Types.ObjectId, ref: 'Student'}],
  teachers        : [{type: Schema.Types.ObjectId, ref: 'Teacher'}],
  createdDate    : {type: Date, default: Date.now},
  updatedDate    : {type: Date, default: Date.now}
});
/**
 * Hooks
 */
ClassroomSchema.pre('save', function (next) {
  next();
});

/**
 * Methods
 *
 * @type {{}}
 */
ClassroomSchema.methods = {
  setProject: function(){

  },
  getProjects: function(){

  }
};


mongoose.model('Classroom', ClassroomSchema);

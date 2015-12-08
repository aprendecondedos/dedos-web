var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassroomSchema = new Schema({
  name            : String,
  education_level : String,
  students        : [{type: Schema.Types.ObjectId, ref: 'Student'}],
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
    this.teachers.push(teachers);
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
            .exec(cb);
    },
    list: function (options, cb) {
      var criteria = options.criteria || {};
      var page = options.page || 0;
      var limit = options.limit || 30;

      return this.find(criteria)
        .populate('teachers', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * page)
        .exec(cb);
    }
}

mongoose.model('Classroom', ClassroomSchema);

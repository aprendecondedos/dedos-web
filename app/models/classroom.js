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
  list: function(){

  },
  getProjects: function(){

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
    }
}

mongoose.model('Classroom', ClassroomSchema);

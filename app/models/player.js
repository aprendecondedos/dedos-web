var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./user');
var User = mongoose.model('User');

var PlayerSchema = new Schema({
  name: String,
  avatar: String,
  projects: [{type: Schema.Types.ObjectId, ref: 'Project'}],
  classes: [{type: Schema.Types.ObjectId, ref: 'Classroom'}],
  createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
  createdDate: {type: Date, default: Date.now},
  updatedDate: {type: Date, default: Date.now}
});
/**
 * Hooks
 */
PlayerSchema.pre('save', function(next) {
  this.updatedDate = Date.now();

  next();
});

/**
 * Methods
 *
 * @type {{}}
 */
PlayerSchema.methods = {
  setProject: function() {

  },
  getProjects: function() {

  }
};

/**
 * Statics
 */

PlayerSchema.statics = {

  /**
   * Buscar usuario por id o cualquier criterio del esquema
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function(options, cb) {
    const criteria = options.criteria || {_id: options};
    return this.findOne(criteria)
      //.populate('projects')
      //.populate('classes')
      .exec(cb);
  }
};

var Player = User.discriminator('Player', PlayerSchema);

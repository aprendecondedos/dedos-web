var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Answer model
var AnswerSchema = mongoose.Schema({
  player: {type: Schema.Types.ObjectId, ref: 'User'},
  activity: {type: Schema.Types.ObjectId, ref: 'Activity'},
  elements: [{
    token: {type: Schema.Types.ObjectId, ref: 'Element'},
    target: String,
    done: Boolean
  }],
  action: String,
  answered: Boolean,
  createdDate: {type: Date, default: Date.now},
  updatedDate: {type: Date, default: Date.now}
});

/**
 * Hooks
 */
AnswerSchema.pre('save', function(next) {
  this.updatedDate = Date.now();

  next();
});

/**
 * Methods
 *
 * @type {{}}
 */
AnswerSchema.methods = {
  setActivities: function(activities) {
    if (util.isArray(activities)) {
      this.activities = activities;
      return this;
    }
  }
};
/**
 * Statics
 */

AnswerSchema.statics = {
  /**
   * Buscar respuesta por id o por criterio
   *
   * @param {ObjectId} options
   */
  load: function(options) {
    const criteria = options.criteria || {_id: options};
    return this.findOne(criteria)
      .exec();
  },
  /**
   * Listar proyectos y filtrarlos
   *
   * @param {Object} options
   */
  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .sort({createdDate: -1})
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Answer', AnswerSchema);

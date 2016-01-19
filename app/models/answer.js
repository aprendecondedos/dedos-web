var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Answer model
var AnswerSchema = mongoose.Schema({
  player: {type: Schema.Types.ObjectId, ref: 'Player'},
  activity: {type: Schema.Types.ObjectId, ref: 'Activity'},
  elements: [{
    token: {type: Schema.Types.ObjectId, ref: 'Token'},
    target: {type: Schema.Types.ObjectId, ref: 'Token'},
    action: String,
    valid: Boolean
  }],
  valid: Boolean,
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
  addElement: function(element_data) {
    var self = this;
    var elementExists = false;
    this.elements.forEach(function(element, index) {
      if (element.token == element_data.token) {
        elementExists = true;
        self.elements[index] = _.extendOwn(self.elements[index], {
          valid: element_data.valid,
          type: element_data.type
        });
      }
    });
    if (!elementExists) {
      this.elements.push(element_data);
    }
    return this;
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

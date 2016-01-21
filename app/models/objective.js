var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ObjectiveSchema = new Schema({
  activity: {type: Schema.Types.ObjectId, ref: 'Activity'},
  type: String
});

/**
 * Hooks
 */
ObjectiveSchema.pre('save', function(next) {
  next();
});

/**
 * Methods
 *
 * @type {{}}
 */
ObjectiveSchema.methods = {
  setProject: function() {

  },
  getProjects: function() {

  }
};

mongoose.model('Objective', ObjectiveSchema);

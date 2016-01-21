var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./objective');
var Objective = mongoose.model('Objective');

var SelectionSchema = new Schema({
  obj: String
});
/**
 * Methods
 *
 * @type {{}}
 */
SelectionSchema.methods = {
  checkToken: function(token) {
    if (this.obj == token.data.name) {
      return true;
    }
    return false;
  },
  getData: function() {
    return this.obj;
  }
};
var Selection = Objective.discriminator('Selection', SelectionSchema);

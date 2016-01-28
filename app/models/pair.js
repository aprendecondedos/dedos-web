var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
require('./objective');
var Objective = mongoose.model('Objective');

var PairSchema = new Schema({
  origen: String,
  tokenMeter: Boolean,
  targets: []
});
/**
 * Methods
 *
 * @type {{}}
 */
PairSchema.methods = {
  checkToken: function(token) {
    if(!this.tokenMeter) {
      if (token.data.name === this.origen || token.area_id === this.origen) {
        if (this.targets.indexOf(token.droppedInto.name) != -1) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  },
  tokenValue: function(data) {

  },
  getData: function() {
    return {
      origen: this.origen,
      targets: this.targets
    };
  },
  setTargets: function(targets) {
    if (util.isArray(targets)) {
      this.targets = targets;
      return this;
    }
  }
};
var Pair = Objective.discriminator('Pair', PairSchema);

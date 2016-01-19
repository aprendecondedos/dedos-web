var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
require('./objective');
var Objective = mongoose.model('Objective');

var TokenMeterSchema = new Schema({
  id: String,
  numValue: String,
  origZones: [],
  origTokens: []
});
/**
 * Methods
 *
 * @type {{}}
 */
TokenMeterSchema.methods = {
  setOriginZones: function(origzones) {
    if (util.isArray(origzones)) {
      this.origZones = origzones;
      return this;
    }
  },
  setOriginTokens: function(origtokens) {
    if (util.isArray(origtokens)) {
      this.origTokens = origtokens;
      return this;
    }
  }
};
var TokenMeter = Objective.discriminator('TokenMeter', TokenMeterSchema);

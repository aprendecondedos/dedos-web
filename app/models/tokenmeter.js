var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
require('./objective');
var Objective = mongoose.model('Objective');

var TokenMeterSchema = new Schema({
  id: String,
  numValue: String,
  origZones: [],
  origTokens: [],
  currentValue: {type: Number, default: 0}
});
/**
 * Methods
 *
 * @type {{}}
 */
TokenMeterSchema.methods = {
  checkToken: function(token) {
    if (this.origTokens.indexOf(token.data.name) || this.origZones.indexOf(token.area_id)) {
      if (token.droppedInto.name == this.id) {
        return true;
      }
    }
    return false;
  },
  checkValue: function(value) {
    if (value < this.numValue || value == this.numValue) {
      return true;
    } else {
      return false;
    }
  },
  getSpecialProperties: function(token) {
    var value = this.currentValue;
    if (token.droppedInto && token.droppedInto.currentValue > 0) {
      value = Number(token.droppedInto.currentValue);
    }
    value += Number(token.data.value);
    this.currentValue = value;
    return {
      valid: this.checkValue(value),
      value: value,
      targetName: this.id
    };
  },
  getData: function() {
    return {
      id: this.id,
      numValue: this.numValue,
      currentValue: 0
    };
  },
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

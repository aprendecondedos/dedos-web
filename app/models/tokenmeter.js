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
  isDone: function(answer) {
    console.log(answer);
    var self = this;
    var value = 0;
    answer.elements.forEach(function(element){
      console.log(element.objective + '     ' + self._id)
      if (element.action == 'tokenMeter' && element.valid && String(element.objective) == String(self._id)) {
        console.log(element);
        value = Number(value) + Number(element.value);
      }
    });
    var done = false;
    console.log(value);
    console.log(this.numValue);
    if (value == this.numValue) {
      done = true;
    } else if (value > this.numValue) {
      done = false;
    } else if (value < this.numValue) {
      done = false;
    }
    return done;
  },
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
    //this.save();
    return {
      valid: this.checkValue(value),
      value: value,
      targetName: token.droppedInto.name
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

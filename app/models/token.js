var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
require('./element');
var Element = mongoose.model('Element');

var TokenSchema = new Schema({
  clickable: Boolean,
  rotatable: Boolean,
  resizable: Boolean,
  movable: Boolean,
  type: String,
  // Type text
  text: String,
  feedback: String,
  // Type image
  urls: []
});
/**
 * Hooks
 */
TokenSchema.pre('save', function(next) {
  next();
});

/**
 * Methods
 *
 * @type {{}}
 */
TokenSchema.methods = {
  setUrls: function(urls) {
    if (this.type != 'img')  return false;
    if (util.isArray(urls)) this.urls = urls;
    return this;
  },
  setText: function(text) {
    if (this.type != 'txt')  return false;
    this.text = text;
    return this;
  }
};
var Token = Element.discriminator('Token', TokenSchema);

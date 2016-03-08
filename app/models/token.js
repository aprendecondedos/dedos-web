var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
require('./element');
var Element = mongoose.model('Element');

var TokenSchema = new Schema({
  value: Number,
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
    if (this.type != 'img') { return false; }
    if (_.isArray(urls)) { this.urls = urls; }
    return this;
  },
  getRandomUrl: function() {
    if (_.isEmpty(this.urls)) {
      return false;
    }
    return _.first(_.shuffle(this.urls));
  },
  setText: function(text) {
    if (this.type != 'txt')  return false;
    this.text = text;
    return this;
  },
  /**
   * Comprobación si el token dado es correcto o no
   *
   * @returns {boolean}
   */
  isCorrect: function() {
    //console.log(this.model('Objective'));
    this.element_id;
    return true;
  },
  getContent: function() {
    if (this.type == 'txt') {
      return this.text;
    } else {
      return this.urls.toString();
    }
  }
};
var Token = Element.discriminator('Token', TokenSchema);

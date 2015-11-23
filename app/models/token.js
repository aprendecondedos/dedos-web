var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./element');
var Element = mongoose.model('Element');

var TokenSchema = new Schema({
    name: String,
    createdAt: Date
});
/**
 * Hooks
 */
TokenSchema.pre('save', function (next) {
    next();
});

/**
 * Methods
 *
 * @type {{}}
 */
TokenSchema.methods = {

};
var Token = Element.discriminator('Token', TokenSchema);

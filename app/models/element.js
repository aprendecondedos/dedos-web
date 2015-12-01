var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElementSchema = new Schema({
    element_id  : String,
    position: {
        x: Number,
        y: Number
    }
});
/**
 * Hooks
 */
ElementSchema.pre('save', function (next) {
    next();
});

/**
 * Methods
 *
 * @type {{}}
 */
ElementSchema.methods = {

};
//require('./area')(BaseSchema);

mongoose.model('Element', ElementSchema);
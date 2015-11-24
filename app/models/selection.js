var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./objective');
var Objective = mongoose.model('Objective');


var SelectionSchema = new Schema({
    obj    : String,
});
/**
 * Methods
 *
 * @type {{}}
 */
SelectionSchema.methods = {

};
var Selection = Objective.discriminator('Selection', SelectionSchema);
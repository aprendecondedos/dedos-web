var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
require('./objective');
var Objective = mongoose.model('Objective');


var PairSchema = new Schema({
    origen         : String,
    tokenMeter     : Boolean,
    targets        : []
});
/**
 * Methods
 *
 * @type {{}}
 */
PairSchema.methods = {
    setTargets: function(targets){
        if (util.isArray(targets)) {
            this.targets = targets;
            return this;
        }
    }
};
var Pair = Objective.discriminator('Pair', PairSchema);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ObjectiveSchema = new Schema({
    type           : String,
    obj            : String,
    tokenMeter     : Boolean,
    numValue       : Number
});
/**
 * Hooks
 */
ObjectiveSchema.pre('save', function (next) {
    next();
});

/**
 * Methods
 *
 * @type {{}}
 */
ObjectiveSchema.methods = {
    setProject: function(){

    },
    getProjects: function(){

    }
};


mongoose.model('Objective', ObjectiveSchema);

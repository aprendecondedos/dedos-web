var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function BaseSchema(){
    Schema.apply(this, arguments);

    this.add({
        player_id: {type: Schema.Types.ObjectId, ref: 'User'},
        createdAt: Date
    });
};


var ElementSchema = new Schema({
    element_id  : String,
    type        : String
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
    setProject: function(){
        console.log('SETTED!');
    },
    getProjects: function(){

    }
};
//require('./area')(BaseSchema);

mongoose.model('Element', ElementSchema);

var util = require('util');
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;


//var ElementSchema = new Schema({
//    name           : String,
//    picture        : String,
//    projects       : [{type: Schema.Types.ObjectId, ref: 'Project'}],
//    classes        : [{type: Schema.Types.ObjectId, ref: 'Class'}],
//    createdBy      : {type: Schema.Types.ObjectId, ref: 'User'},
//    createdDate    : {type: Date, default: Date.now},
//    updatedDate    : {type: Date, default: Date.now}
//});
function BaseSchema(){
    Schema.apply(this, arguments);

    this.add({
        name: String,
        createdAt: Date
    });
};
//util.inherits(BaseSchema, Schema);

//var ElementSchema = new BaseSchema();
var ElementSchema = new Schema({
    name: String,
    createdAt: Date
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

    },
    getProjects: function(){

    }
};
//require('./area')(BaseSchema);

mongoose.model('Element', ElementSchema);

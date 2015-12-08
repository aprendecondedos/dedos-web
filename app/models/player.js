var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./user');
var User = mongoose.model('User');

var PlayerSchema = new Schema({
    name           : String,
    avatar         : String,
    projects       : [{type: Schema.Types.ObjectId, ref: 'Project'}],
    classes        : [{type: Schema.Types.ObjectId, ref: 'Class'}],
    createdBy      : {type: Schema.Types.ObjectId, ref: 'User'},
    createdDate    : {type: Date, default: Date.now},
    updatedDate    : {type: Date, default: Date.now}
});
/**
 * Hooks
 */
PlayerSchema.pre('save', function (next) {
    next();
});

/**
 * Methods
 *
 * @type {{}}
 */
PlayerSchema.methods = {
    setProject: function(){

    },
    getProjects: function(){

    }
};

var Player = User.discriminator('Player', PlayerSchema);
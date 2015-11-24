var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fs = require('fs');
var util = require('util');

// Project model
var ProjectSchema = mongoose.Schema({
    name        : String,
    project     : String,
    data        : String,
    players     : [{type: Schema.Types.ObjectId, ref: 'User' }],
    activities  : [{type: Schema.Types.ObjectId, ref: 'Activity'}],
    // Propiedades extra del proyectos
    properties  : {
        numPlayers     : Number
    },
    createdDate : {type: Date, default: Date.now}
});


ProjectSchema.methods = {

    setActivities: function(activities) {
        if (util.isArray(activities)) {
            this.activities = activities;
            return this;
        }
    }
};

/**
 * Statics
 */

ProjectSchema.statics = {

    /**
     * Buscar proyecto por id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({_id: id})
            //.populate('user', 'name email username')
            //.populate('comments.user')
            .populate('activities')
            .exec(cb);
    }
}

mongoose.model('Project', ProjectSchema);


// Action model
var actionSchema = mongoose.Schema({
    player_id       : { type: Schema.Types.ObjectId, ref: 'User' },
    action          : String,
    answered        : Boolean,
    done            : Boolean,
    element_id      : { type: Schema.Types.ObjectId, ref: 'Element' },
    createdDate     : {type: Date, default: Date.now}
});
var Action  = mongoose.model('ActionXX', actionSchema);